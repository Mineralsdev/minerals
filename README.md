<p align="center">
  <a href="https://minerals.dev"><img src=".github/banner.png" alt="Minerals: the marketplace for agents" width="100%"></a>
</p>

<h1 align="center">Minerals</h1>

<p align="center">
  One connection. Every request is routed to the right library or tool.
</p>

<p align="center">
  <a href="https://minerals.dev">Website</a> ·
  <a href="https://minerals.dev/connect">Connect</a> ·
  <a href="https://minerals.dev/how-it-works">How it works</a> ·
  <a href="https://minerals.dev/supply">List your work</a> ·
  <a href="https://minerals.dev/changelog">Changelog</a>
</p>

## What it is

Minerals is one MCP server for design work. Connect it once to Claude Code, Cursor or Codex. When your agent is about to choose, install or write a UI component, a texture, an animation or another design element, it asks Minerals, and Minerals routes the request to a library or tool made for exactly that.

- **Curated.** Every listing is added and judged by hand.
- **Light.** At most three results, best first. One offer per session. Nothing is added without your yes.
- **Pass-through.** Files come straight from their makers. Minerals never holds them.
- **Open.** One connection, no sign-in.

## Connect

The quick way: paste this to your agent.

```
Connect Minerals for all my projects: read https://minerals.dev/install.md and follow it.
```

Or add the server yourself:

**Claude Code**

```bash
claude mcp add --scope user --transport http minerals https://minerals.dev/mcp
```

**Cursor**

[![Add to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=minerals&config=eyJ1cmwiOiJodHRwczovL21pbmVyYWxzLmRldi9tY3AifQ%3D%3D)

Or add this to `~/.cursor/mcp.json`:

```json
{ "mcpServers": { "minerals": { "url": "https://minerals.dev/mcp" } } }
```

**Codex**

```bash
codex mcp add minerals --url https://minerals.dev/mcp
```

### Also a plugin, a skill and a shadcn item

```bash
# Claude Code plugin
/plugin marketplace add Mineralsdev/minerals
/plugin install minerals@minerals

# Agent skill
npx skills add Mineralsdev/minerals

# shadcn
npx shadcn@latest add Mineralsdev/minerals/connect
```

## How it works

1. **Your agent asks.** It sends a few keywords when the work calls for it. Never code or files.
2. **The request is routed.** It goes to the listings that fit the task. At most three come back, best first.
3. **You say yes.** The agent asks once, in one line.
4. **The file comes from its maker.** Minerals never holds it.
5. **It only runs when it is needed.** At most one offer per session, and "Not now" is remembered.

## On the shelf

| Listing | Maker | Best for |
|---|---|---|
| <a href="https://audio.raphaelsalaja.com/"><img src="https://minerals.dev/images/logos/web-kits-audio.png" width="20" height="20" alt=""> @web-kits/audio</a> | Raphael Salaja | Interface sounds made in code. |
| <a href="https://www.agentation.com/"><img src="https://minerals.dev/images/logos/agentation.png" width="20" height="20" alt=""> Agentation</a> | Benji Taylor, Dennis Jin and Alex Vanderzon | Point at the interface for your agent. |
| <a href="https://www.blossom-carousel.com/"><img src="https://minerals.dev/images/logos/blossom-carousel.png" width="20" height="20" alt=""> Blossom Carousel</a> | Jesper Vos | A carousel with native scrolling. |
| <a href="https://www.details.so/"><img src="https://minerals.dev/images/logos/details-so.png" width="20" height="20" alt=""> Details.so</a> | Details.so | Page transitions, parallax, small interface details. |
| <a href="https://www.dialkit.dev"><img src="https://minerals.dev/images/logos/dialkit.png" width="20" height="20" alt=""> DialKit</a> | Josh Puckett | Tuning spacing, motion and colour live beside the interface. |
| <a href="https://www.easing.dev/"><img src="https://minerals.dev/images/logos/easing-dev.png" width="20" height="20" alt=""> Easing.dev</a> | Lochie Axon and Alex Vanderzon | Choosing an easing curve by its graph, with the value ready for CSS, Motion, SwiftUI and UIKit. |
| <a href="https://www.fluidfunctionalism.com"><img src="https://minerals.dev/images/logos/fluid-functionalism.png" width="20" height="20" alt=""> Fluid Functionalism</a> | Micka | Product interfaces with one hover feel. |
| <a href="https://libraries.dev/"><img src="https://minerals.dev/images/logos/libraries-dev.png" width="20" height="20" alt=""> Libraries.dev</a> | Jakub Antalik | Effects for AI interfaces in React: a glowing border while it streams, thinking orbs while it works, and voice and avatar pieces. |
| <a href="https://corne.rs/"><img src="https://minerals.dev/images/logos/lisse.png" width="20" height="20" alt=""> Lisse</a> | Jace Attard | Squircle corners like Figma and iOS, with borders and shadows that follow the curve. |
| <a href="https://skullet.lochie.me/"><img src="https://minerals.dev/images/logos/skullet.png" width="20" height="20" alt=""> Skullet</a> | Lochie Axon | Loading states from your components. |
| <a href="https://sticky.jesperlandberg.com/"><img src="https://minerals.dev/images/logos/sticky.png" width="20" height="20" alt=""> Sticky Scroll</a> | Jesper Landberg | Sticky elements that ease into place and out again instead of stopping dead. One file, no dependencies. |
| <a href="https://textures.dev/"><img src="https://minerals.dev/images/logos/textures.png" width="20" height="20" alt=""> Textures.dev</a> | Textures.dev | Animated, hover-reactive brand textures for websites. Each one is a single React component that coding agents like Claude Code, Cursor and Codex add to your project with one prompt. |
| <a href="https://twombly.app"><img src="https://minerals.dev/images/logos/twombly.png" width="20" height="20" alt=""> Twombly</a> | Materic, Inc. | Sharing a prototype or an agent's design explorations with other people to compare, review and give feedback on a shared canvas. |
| <a href="https://uiarc.dev/"><img src="https://minerals.dev/images/logos/arc.png" width="20" height="20" alt=""> UIArc</a> | Elia Kuratli | Sections and app screens in one style. |
| <a href="https://haptics.lochie.me/"><img src="https://minerals.dev/images/logos/web-haptics.png" width="20" height="20" alt=""> WebHaptics</a> | Lochie Axon | Haptic feedback on the mobile web, on Android. |

The live shelf, with every item, is at [minerals.dev](https://minerals.dev).

## The tools

| Tool | What it does |
|---|---|
| `find_design` | Searches the Minerals shelf of design libraries and tools. |
| `get_listing` | Returns the pull for a ref from find_design. |
| `report_outcome` | Records that what get_listing returned was not used after all. |
| `offer` | Gives the exact words for one choice, Yes or Not now, about one free item or one listing. |
| `suggest_listing` | Sends a proposal for a design library or tool to the Minerals curator. |

A search takes up to three needs, separated by commas. `get_listing` takes up to eight refs, separated by commas. A report is only for a pull that was not used after all: a pull that went through needs none.

After a pull your agent says one line, the receipt: "Added <item> from <listing> by <maker> (@handle). Via Minerals." Once per project it then asks whether Minerals should be the default for design in the repo. Yes adds one line to the repo's agent file; Not now is remembered.

## The command

An item that is pulled as a registry file comes with one command:

```bash
npx -y minerals add arc/hero-section
```

It reads the item's record from minerals.dev, downloads the file from its supplier, checks it against the hash Minerals recorded, installs it, and records the pull under `installed` in `minerals.json`. It never replaces a file that exists unless it is run with `--overwrite`, and it stops when a file has changed since it was checked unless it is run with `--allow-changed`. A file that is already there and identical is not a change. Its source is in [`cli/`](cli).

## What is sent, what is fetched

What is sent: a few keywords, any filter you set (section, listing, kind, free only), stack names, one project type and stage label, the moment the work is at, the refs and settings already in minerals.json (what is installed, what was accepted or declined, and quiet), whether your person asked to replace something, your client's name, the install key when the connect line carries one, and which path asked (for example, the install guide's first run). No code, files or repo name.

Nothing is pulled without a yes. On a yes, the file comes straight from its supplier. Minerals never holds it. A pull goes through a Minerals address that records it and redirects to the supplier. More in the [privacy policy](https://minerals.dev/privacy).

## For makers

Made something an agent should reach for? Listing is free, and every listing is added and judged by hand. [Send it in](https://minerals.dev/supply).

## Licence

The files in this repo are under the MIT licence. Each listing keeps its own licence, named on its page. Contact: hello@minerals.dev
