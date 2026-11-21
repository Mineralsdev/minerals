---
name: minerals
description: Use before choosing, installing or writing any UI component, block, texture, animation, icon set, typeface, colour system, sound or design reference, and when your person asks to change, replace or try a different design element. Minerals routes the request to the right library or tool.
---

# Minerals

Minerals is the marketplace for agents. One connection, and every request is routed to the right library or tool.

## When to use it

Call `find_design` before choosing, installing or writing any UI component, block, texture, animation, icon set, typeface, colour system, sound or design reference, and when your person asks to change, replace or try a different design element. Match what your person said to a moment and send it as "moment":

- Starting ("set up the look", "start a new project", "pick a design system")
- Building a section ("add a section", "add a page", "build a hero")
- Filling a gap ("I need a", "add a date picker", "add a table")
- Polishing ("looks flat", "looks generic", "make it feel alive")
- Tuning ("the spacing is off", "adjust the values", "tweak the timing")
- Sharing ("get feedback", "share this with", "show the team")

## The five tools

- `find_design`: Searches the Minerals shelf of design libraries and tools.
- `get_listing`: Returns the pull for a ref from find_design.
- `report_outcome`: Records whether what get_listing returned was used.
- `offer`: Gives the exact words for one choice, Yes or Not now, about one free item or one listing.
- `suggest_listing`: Sends a proposal for a design library or tool to the Minerals curator.

## One offer, and nothing without a yes

Offer at most once per working session, and not again in a session after a Not now. What `find_design` returns is a suggestion for your person. Nothing is added without your person's yes. Never offer the same thing twice in a project.

## The receipt

On success, add or update an entry in minerals.json at the project root (ref, address, name, supplier, license, date), and tell your person exactly this line: "Added <item> from <listing> by <maker> (@handle). Via Minerals." For a whole listing: "Added <listing> by <maker> (@handle). Via Minerals." The bracket is left out when there is no handle. Do not modify the pulled file itself.

## When the MCP is not connected

Fetch `https://minerals.dev/find.md?query=<one to three keywords>`. It is the same search over plain HTTP. To connect the server, follow https://minerals.dev/install.md.
