#!/usr/bin/env node
// Minerals: one command for a pull. No dependencies. It sends nothing anywhere except the requests a pull needs:
// the item's record from minerals.dev, the file through its pull address (or the supplier's own on failure), and,
// in a project with components.json, what shadcn itself fetches.
//
//   npx -y minerals                   what Minerals is, and where to connect it
//   npx -y minerals add <ref> [<ref>…]   pull one or several items, e.g. arc/hero-section
//     --overwrite        replace files that already exist
//     --allow-changed    go on although a file differs from the hash Minerals recorded
//
// Exit codes: 0 done, 1 could not be done, 2 files that exist would change, 3 a file has changed since it was checked.
'use strict'
const { createHash } = require('node:crypto')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const SITE = 'https://minerals.dev'
// shadcn is pinned to the major version this command was written against: it reads that version's dry run.
const SHADCN = 'shadcn@4'
const args = process.argv.slice(2)

/** Stops with one sentence that says why, as the last line. */
function stop(code, sentence) {
  cleanUp()
  console.log(sentence)
  process.exit(code)
}

const temporary = []
function cleanUp() {
  for (const f of temporary.splice(0)) fs.rmSync(f, { force: true })
}
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    cleanUp()
    process.exit(1)
  })
}

/** A supplier's text as it may be printed: no control characters, 200 characters at most. */
const shown = (text) => String(text).replace(/[\x00-\x1f\x7f-\x9f]/g, ' ').split(String.fromCharCode(0x2028)).join(' ').split(String.fromCharCode(0x2029)).join(' ').slice(0, 200)

/** A plain npm package name: letters, digits, dots, hyphens and underscores, one optional @scope/ in front, an optional @version behind. The name, the scope and the version each start with a letter or a digit, so "--force" and "-g" are not names. */
const PART = '[A-Za-z0-9][A-Za-z0-9._-]*'
// A version may begin with ^ or ~ ("@base-ui/react@^1.9.0"). Such a name is printed in double quotes, so a shell reads it as one word.
const PACKAGE = new RegExp(`^(@${PART}/)?${PART}(@[~^]?${PART})?$`)
const quoted = (name) => (/[~^]/.test(name) ? `"${name}"` : name)
/** A plain https address, every character from a list: the host in letters, digits, dots and hyphens, an optional port, and in the path and the query (after one "?") only letters, digits and . _ ~ % / + @ = , : - */
const ADDRESS = /^https:\/\/[A-Za-z0-9.-]+(:[0-9]+)?(\/[A-Za-z0-9._~%\/+@=,:-]*)?(\?[A-Za-z0-9._~%\/+@=,:-]*)?$/

/** One download, 20 seconds at most. A failure carries the status, or the reason in a few words. */
async function get(url) {
  let res
  try {
    res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) })
    if (res.ok) return Buffer.from(await res.arrayBuffer())
  } catch (err) {
    throw Object.assign(new Error('no answer'), { why: err && err.name === 'TimeoutError' ? 'no answer in 20 seconds' : 'no connection' })
  }
  throw Object.assign(new Error(String(res.status)), { status: res.status, why: String(res.status) })
}

/**
 * Where a registry file's entry goes in a project without components.json. Null when it would leave the project
 * folder, also through a symlinked folder, or land in a dot folder, a dot file or node_modules.
 */
function placeOf(file, root) {
  const named = String(file.target || file.path || '')
  const mapped = named.replace(/^~\//, '').replace(/^@components\//, 'components/').replace(/^@ui\//, 'components/ui/').replace(/^@lib\//, 'lib/').replace(/^@hooks\//, 'hooks/')
  if (!mapped) return null
  const full = path.resolve(root, mapped)
  if (!full.startsWith(root + path.sep)) return null
  // Never into a folder or file whose name starts with a dot (.git, .github, .env), and never into node_modules, in any casing.
  // A part with "~" or one that ends in a dot or a space can be another name for such a folder on Windows.
  const parts = path.relative(root, full).split(path.sep)
  if (parts.some((part) => part.startsWith('.') || part.toLowerCase() === 'node_modules' || part.includes('~') || /[. ]$/.test(part))) return null
  // The nearest folder that exists must really lie inside the project: a symlinked folder is not followed out of it.
  let parent = path.dirname(full)
  while (!fs.existsSync(parent)) parent = path.dirname(parent)
  const real = fs.realpathSync(parent)
  const realRoot = fs.realpathSync(root)
  return real === realRoot || real.startsWith(realRoot + path.sep) ? full : null
}

/** Whether something is at a path. A symlink counts, also one that points nowhere. */
const isThere = (p) => !!fs.lstatSync(p, { throwIfNoEntry: false })

/** Whether a regular file (not a symlink) is at a path and holds exactly this content. Such a file is already there: it is not a change. */
function isSame(p, content) {
  const at = fs.lstatSync(p, { throwIfNoEntry: false })
  if (!at || !at.isFile()) return false
  try {
    return fs.readFileSync(p).equals(Buffer.from(content))
  } catch {
    return false
  }
}

async function add() {
  const overwrite = args.includes('--overwrite')
  const allowChanged = args.includes('--allow-changed')
  const refs = [...new Set(args.slice(1).filter((a) => !a.startsWith('--')).map((r) => r.toLowerCase()))]
  if (!refs.length) stop(1, 'Name at least one ref, for example: npx -y minerals add arc/hero-section')
  const root = process.cwd()
  const notes = []

  // 1. Each item's record from Minerals.
  const records = []
  for (const ref of refs) {
    if (!/^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*){1,3}$/.test(ref)) stop(1, `"${ref}" is not an item ref. An item ref looks like arc/hero-section.`)
    let record
    try {
      record = JSON.parse((await get(`${SITE}/api/record/${ref}`)).toString())
    } catch (err) {
      if (err && err.status === 404) stop(1, `Minerals has no free item with the ref "${ref}".`)
      stop(1, `Minerals could not be reached (${(err && err.why) || 'an answer that could not be read'}). Try again in a minute, or use the steps at ${SITE}/${ref}.md`)
    }
    records.push({ ...record, asked: ref })
  }

  // 2. The file, through the pull address, so the pull is counted. On failure, the supplier's own address.
  // 3. Its SHA-256 against the one Minerals recorded.
  let checked = 0
  for (const r of records) {
    let body
    try {
      body = await get(r.pull)
    } catch {
      try {
        if (!r.fallback) throw new Error('no fallback')
        body = await get(r.fallback)
      } catch {
        stop(1, `The file for ${r.asked} could not be downloaded.`)
      }
    }
    if (r.sha256 && createHash('sha256').update(body).digest('hex') !== r.sha256) {
      const changed = `The file for ${r.asked} has changed since ${shown(r.checked || 'it was checked')}.`
      if (!allowChanged) {
        console.log(changed)
        stop(3, 'Nothing was installed. Ask your person before running again with --allow-changed.')
      }
      notes.push(`${changed} It is used as it is now.`)
    } else if (r.sha256) checked++
    try {
      r.file = JSON.parse(body.toString())
    } catch {
      stop(1, `The file for ${r.asked} is not a registry file.`)
    }
    if (!r.file || typeof r.file !== 'object' || Array.isArray(r.file)) stop(1, `The file for ${r.asked} is not a registry file.`)
    r.temp = path.join(root, `.minerals-${r.asked.replace(/\//g, '-')}-${process.pid}.json`)
    fs.writeFileSync(r.temp, body)
    temporary.push(r.temp)
  }
  const list = (v) => (Array.isArray(v) ? v.map(String) : [])
  const pulledIn = [...new Set(records.flatMap((r) => list(r.file.registryDependencies)))]

  // 4. Install.
  if (fs.existsSync(path.join(root, 'components.json'))) {
    const files = records.map((r) => `./${path.basename(r.temp)}`)
    // On Windows npx is a .cmd file, which Node only starts through a shell. Every argument here is this command's own: fixed words and file names made from refs that passed the check above.
    const shell = process.platform === 'win32'
    const dry = spawnSync('npx', ['-y', SHADCN, 'add', ...files, '--dry-run'], { cwd: root, encoding: 'utf8', shell, timeout: 120000 })
    if (dry.error && dry.error.code === 'ETIMEDOUT') stop(1, 'The shadcn dry run did not finish in 2 minutes, so nothing was installed.')
    if (dry.status !== 0) stop(1, 'The shadcn dry run failed, so nothing was installed.')
    const said = `${dry.stdout}\n${dry.stderr}`
    // The dry run of this shadcn version lists what it would do under "Files (n)". Without that, its answer is not trusted.
    if (!/Files \(\d+\)/.test(said)) stop(1, `shadcn's answer could not be read, so nothing was installed. The steps are at ${SITE}/${records[0].asked}.md`)
    // It marks a file that exists and would be replaced with "~ <path> overwrite".
    const marked = said.split('\n').map((line) => line.match(/~\s+(.+?)\s+overwrite\b/)).filter(Boolean).map((m) => m[1])
    // Of those, a file of a ref that was asked for, at the place it names, that already holds the incoming content is not a change. What shadcn pulls in itself is judged as before.
    const incoming = new Map()
    for (const r of records) {
      for (const f of Array.isArray(r.file.files) ? r.file.files : []) {
        const to = f && typeof f === 'object' && f.target && typeof f.content === 'string' ? placeOf(f, root) : null
        if (to) incoming.set(to, f.content)
      }
    }
    const same = marked.filter((f) => incoming.has(path.resolve(root, f)) && isSame(path.resolve(root, f), incoming.get(path.resolve(root, f))))
    for (const f of same) console.log(`Already there: ${shown(f)}`)
    const would = marked.filter((f) => !same.includes(f))
    if (would.length && !overwrite) {
      console.log('These files exist and would change:')
      for (const f of would) console.log(`  ${shown(f)}`)
      stop(2, 'Nothing was installed. Ask your person before running again with --overwrite.')
    }
    // shadcn asks about every file that exists, also one that would not change, and nobody is there to answer. When all that is left are files
    // that already hold the incoming content, it is told to write them: the same file again, in the form shadcn gives it.
    const run = spawnSync('npx', ['-y', SHADCN, 'add', ...files, '--yes', ...(overwrite || same.length ? ['--overwrite'] : [])], { cwd: root, stdio: ['ignore', 'inherit', 'inherit'], shell, timeout: 300000 })
    if (run.error && run.error.code === 'ETIMEDOUT') stop(1, 'shadcn did not finish in 5 minutes. Look at what it wrote before running again.')
    if (run.status !== 0) stop(1, 'shadcn could not install the files.')
    notes.push(`Checked against Minerals' hash: ${checked}.${pulledIn.length ? ` Not checked: ${pulledIn.length} ${pulledIn.length === 1 ? 'file' : 'files'} it pulls in.` : ''}`)
  } else {
    // Without components.json: the files each registry file names, never outside the project folder.
    // A file with no fixed destination is placed by shadcn, by its type. Written by hand it would land in the supplier's own
    // folder, where nothing finds it: such an item needs a shadcn project, and nothing is written.
    if (records.some((r) => (Array.isArray(r.file.files) ? r.file.files : []).some((f) => f && typeof f === 'object' && !f.target))) {
      stop(1, 'This item needs a shadcn project. Run npx shadcn@latest init first, then run this again.')
    }
    const writes = []
    for (const r of records) {
      for (const f of Array.isArray(r.file.files) ? r.file.files : []) {
        const to = f && typeof f === 'object' ? placeOf(f, root) : null
        if (!to) stop(1, `${r.asked} names a file outside the project folder, in a dot folder or in node_modules, so nothing was installed.`)
        if (typeof f.content !== 'string') stop(1, `${r.asked} names a file without content, so nothing was installed.`)
        writes.push({ to, content: f.content, same: isSame(to, f.content) })
      }
    }
    for (const w of writes) if (w.same) console.log(`Already there: ${shown(path.relative(root, w.to))}`)
    const exist = writes.filter((w) => !w.same && isThere(w.to)).map((w) => path.relative(root, w.to))
    if (exist.length && !overwrite) {
      console.log('These files exist and would change:')
      for (const f of exist) console.log(`  ${shown(f)}`)
      stop(2, 'Nothing was installed. Ask your person before running again with --overwrite.')
    }
    for (const w of writes) {
      if (w.same) continue
      fs.mkdirSync(path.dirname(w.to), { recursive: true })
      // A symlink at the place is replaced by the file, never written through.
      if (isThere(w.to)) fs.rmSync(w.to, { force: true })
      fs.writeFileSync(w.to, w.content)
      console.log(`Wrote ${shown(path.relative(root, w.to))}`)
    }
    // What is still missing: packages, and the registry files this one depends on, by ref where Minerals lists them.
    const packages = [...new Set(records.flatMap((r) => list(r.file.dependencies)))]
    // An agent will run this line in a shell: only a plain npm package name, with an optional version, is put on it.
    const named = packages.filter((n) => PACKAGE.test(n))
    if (named.length) notes.push(`Still needed: npm install ${named.map(quoted).join(' ')}`)
    if (named.length < packages.length) notes.push(`Not printed: ${packages.length - named.length} ${packages.length - named.length === 1 ? 'name that is not a package name' : 'names that are not package names'}.`)
    const listed = []
    const other = []
    await Promise.all(
      pulledIn.map(async (address) => {
        const from = records.find((r) => list(r.file.registryDependencies).includes(address))
        const name = (address.match(/([a-z0-9][a-z0-9-]*)\.json$/i) || [])[1]
        // A dependency at the supplier's own address may be listed too: its record must name exactly this address.
        const guess = name && /^https:\/\//.test(address) ? `${from.asked.split('/')[0]}/${name.toLowerCase()}` : null
        try {
          if (!guess) throw new Error('no ref')
          const known = JSON.parse((await get(`${SITE}/api/record/${guess}`)).toString())
          if (known.fallback !== address) throw new Error('another file')
          if (!refs.includes(guess)) listed.push(guess)
        } catch {
          other.push(address)
        }
      }),
    )
    if (listed.length) notes.push(`Also needed: npx -y minerals add ${listed.sort().join(' ')}`)
    // The same for an address: only a plain https address is printed.
    const plain = other.filter((a) => ADDRESS.test(a)).sort()
    if (plain.length) notes.push(`Also needed, from the supplier: ${plain.join(' ')}`)
    if (plain.length < other.length) notes.push(`Not printed: ${other.length - plain.length} ${other.length - plain.length === 1 ? 'address that is not plain https' : 'addresses that are not plain https'}.`)
    notes.push(`Checked against Minerals' hash: ${checked}.`)
  }

  // 5. minerals.json: one entry per item under "installed", added or updated. A file that cannot be read is left as it is.
  const at = path.join(root, 'minerals.json')
  let project = {}
  let readable = true
  if (isThere(at)) {
    try {
      project = JSON.parse(fs.readFileSync(at, 'utf8'))
    } catch {
      readable = false
    }
    if (!project || typeof project !== 'object' || Array.isArray(project)) readable = false
  }
  if (readable && project.installed !== undefined && !Array.isArray(project.installed)) readable = false
  if (!readable) {
    notes.push('minerals.json could not be read, so this pull was not recorded in it.')
  } else {
    const entries = Array.isArray(project.installed) ? [...project.installed] : []
    const date = new Date().toISOString().slice(0, 10)
    for (const r of records) {
      const entry = { ref: r.ref, address: r.address, name: r.name, supplier: r.supplier, license: r.licence, date }
      const i = entries.findIndex((e) => e === r.ref || (e && typeof e === 'object' && e.ref === r.ref))
      if (i < 0) entries.push(entry)
      else entries[i] = entries[i] && typeof entries[i] === 'object' ? { ...entries[i], ...entry } : entry
    }
    project.installed = entries
    try {
      fs.writeFileSync(at, JSON.stringify(project, null, 2) + '\n')
    } catch {
      notes.push('minerals.json could not be written, so this pull was not recorded in it.')
    }
  }

  // 6. The temporary files go.
  cleanUp()

  // 7. What there is to say, then the receipt: one line per listing, and the last line printed.
  for (const note of notes) console.log(note)
  const byListing = new Map()
  for (const r of records) byListing.set(r.listing, [...(byListing.get(r.listing) || []), r])
  for (const mine of byListing.values()) console.log(shown(mine.length === 1 ? mine[0].receipt : String(mine[0].receipt_several).replace('<n>', String(mine.length))))
}

if (args[0] === 'add') {
  add().catch(() => stop(1, 'The pull could not be finished.'))
} else {
  console.log('Minerals is the marketplace for agents. One connection, and every request is routed to the right library or tool.')
  console.log('https://minerals.dev/connect')
}
