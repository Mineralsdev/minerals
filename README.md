# Minerals

**The Marketplace For Agents.**

One connection. Every request is routed to the right library or tool.

Minerals is the marketplace for agents. One connection, and every request is routed to the right library or tool. It is one MCP server, with no sign-in: `https://minerals.dev/mcp`

## Connect

Add the server for all projects, with the command for your client:

- Claude Code: `claude mcp add --scope user --transport http minerals https://minerals.dev/mcp`
- Cursor: add `"minerals": { "url": "https://minerals.dev/mcp" }` under `mcpServers` in `~/.cursor/mcp.json`; merge this into the existing file; keep every other server
- Codex: `codex mcp add minerals --url https://minerals.dev/mcp`

The full guide for an agent is at https://minerals.dev/install.md. This repo is also a plugin for Claude Code and Cursor, and holds one skill:

```
/plugin marketplace add Mineralsdev/minerals
/plugin install minerals@minerals
```

```
npx skills add Mineralsdev/minerals
```

## What is sent

What is sent: a few keywords, any filter you set (section, listing, kind, free only), stack names, one project type and stage label, the moment the work is at, the refs and settings already in minerals.json (what is installed, what was accepted or declined, and quiet), whether your person asked to replace something, your client's name, the install key when the connect line carries one, and which path asked (for example, the install guide's first run). No code, files or repo name.

## What is fetched

Nothing is pulled without a yes. On a yes, the file comes straight from its supplier. Minerals never holds it. A pull goes through a Minerals address that records it and redirects to the supplier.

## Listings

Read from https://minerals.dev/index.json.

| Listing | Maker | Site |
|---|---|---|
| [Blossom Carousel](https://minerals.dev/blossom-carousel) | Jesper Vos | https://www.blossom-carousel.com/ |
| [Details.so](https://minerals.dev/details-so) | Details.so | https://www.details.so/ |
| [DialKit](https://minerals.dev/dialkit) | Josh Puckett | https://www.dialkit.dev |
| [Fluid Functionalism](https://minerals.dev/fluid-functionalism) | @micka_design | https://www.fluidfunctionalism.com |
| [Libraries.dev](https://minerals.dev/libraries-dev) | Jakub Antalik | https://libraries.dev/ |
| [Sticky Scroll](https://minerals.dev/sticky) | Jesper Landberg | https://sticky.jesperlandberg.com/ |
| [Textures.dev](https://minerals.dev/textures) | Textures.dev | https://textures.dev/ |
| [Twombly](https://minerals.dev/twombly) | Materic, Inc. | https://twombly.app |
| [UIArc](https://minerals.dev/arc) | Elia Kuratli | https://uiarc.dev/ |

## Licence and contact

The files in this repo are under the MIT licence; see [LICENSE](LICENSE). Each listing keeps its own licence, named on its page.

Contact: hello@minerals.dev
