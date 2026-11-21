#!/usr/bin/env node
// Minerals: one command for a pull. No dependencies. It sends nothing anywhere except the requests a pull needs:
// the item's record from minerals.dev, the file through its pull address (or the supplier's own on failure), and,
// in a project with components.json, what shadcn itself fetches.
//
//   npx minerals                      what Minerals is, and where to connect it
//   npx minerals add <ref> [<ref>…]   pull one or several items, e.g. arc/hero-section
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

async function get(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`${res.status} at ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

/** Where a registry file's entry goes in a project without components.json. Null when it would leave the project folder. */
function placeOf(file, root) {
  const named = String(file.target || file.path || '')
  const mapped = named.replace(/^~\//, '').replace(/^@components\//, 'components/').replace(/^@ui\//, 'components/ui/').replace(/^@lib\//, 'lib/').replace(/^@hooks\//, 'hooks/')
  if (!mapped) return null
  const full = path.resolve(root, mapped)
  return full.startsWith(root + path.sep) ? full : null
}

async function add() {
  const overwrite = args.includes('--overwrite')
  const allowChanged = args.includes('--allow-changed')
  const refs = [...new Set(args.slice(1).filter((a) => !a.startsWith('--')).map((r) => r.toLowerCase()))]
  if (!refs.length) stop(1, 'Name at least one ref, for example: npx minerals add arc/hero-section')
  const root = process.cwd()

  // 1. Each item's record from Minerals.
  const records = []
  for (const ref of refs) {
    if (!/^[a-z0-9][a-z0-9-]*(\/[a-z0-9][a-z0-9-]*){1,3}$/.test(ref)) stop(1, `"${ref}" is not an item ref. An item ref looks like arc/hero-section.`)
    try {
      records.push(JSON.parse((await get(`${SITE}/api/record/${ref}`)).toString()))
    } catch {
      stop(1, `Minerals has no free item with the ref "${ref}".`)
    }
  }

  // 2. The file, through the pull address, so the pull is counted. On failure, the supplier's own address.
  // 3. Its SHA-256 against the one Minerals recorded.
  for (const r of records) {
    let body
    try {
      body = await get(r.pull)
    } catch {
      try {
        if (!r.fallback) throw new Error('no fallback')
        body = await get(r.fallback)
      } catch {
        stop(1, `The file for ${r.ref} could not be downloaded.`)
      }
    }
    if (r.sha256 && createHash('sha256').update(body).digest('hex') !== r.sha256 && !allowChanged) {
      stop(3, `The file for ${r.ref} has changed since ${r.checked || 'it was checked'}. Nothing was installed; run again with --allow-changed to use it.`)
    }
    try {
      r.file = JSON.parse(body.toString())
    } catch {
      stop(1, `The file for ${r.ref} is not a registry file.`)
    }
    r.temp = path.join(root, `.minerals-${r.ref.replace(/\//g, '-')}-${process.pid}.json`)
    fs.writeFileSync(r.temp, body)
    temporary.push(r.temp)
  }

  // 4. Install.
  if (fs.existsSync(path.join(root, 'components.json'))) {
    const files = records.map((r) => `./${path.basename(r.temp)}`)
    const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
    const dry = spawnSync(npx, ['-y', 'shadcn@latest', 'add', ...files, '--dry-run'], { cwd: root, encoding: 'utf8' })
    if (dry.status !== 0) stop(1, 'The shadcn dry run failed, so nothing was installed.')
    // The dry run marks a file that exists and would be replaced with "~ <path> overwrite".
    const would = [...`${dry.stdout}\n${dry.stderr}`.matchAll(/~\s+(\S+)\s+overwrite/g)].map((m) => m[1])
    if (would.length && !overwrite) {
      console.log('These files exist and would change:')
      for (const f of would) console.log(`  ${f}`)
      stop(2, 'Nothing was installed; run again with --overwrite to replace them.')
    }
    const run = spawnSync(npx, ['-y', 'shadcn@latest', 'add', ...files, '--yes', ...(overwrite ? ['--overwrite'] : [])], { cwd: root, stdio: 'inherit' })
    if (run.status !== 0) stop(1, 'shadcn could not install the files.')
  } else {
    // Without components.json: the files each registry file names, never outside the project folder.
    const writes = []
    for (const r of records) {
      for (const f of r.file.files || []) {
        const to = placeOf(f, root)
        if (!to) stop(1, `${r.ref} names a file outside the project folder, so nothing was installed.`)
        if (typeof f.content !== 'string') stop(1, `${r.ref} names a file without content, so nothing was installed.`)
        writes.push({ to, content: f.content })
      }
    }
    const exist = writes.filter((w) => fs.existsSync(w.to)).map((w) => path.relative(root, w.to))
    if (exist.length && !overwrite) {
      console.log('These files exist and would change:')
      for (const f of exist) console.log(`  ${f}`)
      stop(2, 'Nothing was installed; run again with --overwrite to replace them.')
    }
    for (const w of writes) {
      fs.mkdirSync(path.dirname(w.to), { recursive: true })
      fs.writeFileSync(w.to, w.content)
      console.log(`Wrote ${path.relative(root, w.to)}`)
    }
    const needs = [...new Set(records.flatMap((r) => [...(r.file.dependencies || []), ...(r.file.registryDependencies || [])]))]
    if (needs.length) console.log(`Not installed, because this project has no components.json: ${needs.join(', ')}`)
  }

  // 5. minerals.json: one entry per item, added or updated.
  const at = path.join(root, 'minerals.json')
  let project = {}
  try {
    project = JSON.parse(fs.readFileSync(at, 'utf8'))
  } catch {}
  const list = Array.isArray(project.installed) ? 'installed' : Array.isArray(project.items) ? 'items' : 'installed'
  const entries = Array.isArray(project[list]) ? project[list].filter((e) => e && typeof e === 'object') : []
  const date = new Date().toISOString().slice(0, 10)
  for (const r of records) {
    const entry = { ref: r.ref, address: r.address, name: r.name, supplier: r.supplier, license: r.licence, date }
    const i = entries.findIndex((e) => e.ref === r.ref)
    if (i < 0) entries.push(entry)
    else entries[i] = { ...entries[i], ...entry }
  }
  project[list] = entries
  fs.writeFileSync(at, JSON.stringify(project, null, 2) + '\n')

  // 6. The temporary files go.
  cleanUp()

  // 7. The receipt: one line per listing, and the last line printed.
  const byListing = new Map()
  for (const r of records) byListing.set(r.listing, [...(byListing.get(r.listing) || []), r])
  for (const mine of byListing.values()) console.log(mine.length === 1 ? mine[0].receipt : mine[0].receipt_several.replace('<n>', String(mine.length)))
}

if (args[0] === 'add') {
  add().catch(() => stop(1, 'The pull could not be finished.'))
} else {
  console.log('Minerals is the marketplace for agents. One connection, and every request is routed to the right library or tool.')
  console.log('https://minerals.dev/connect')
}
