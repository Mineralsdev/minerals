# minerals

One command that pulls a free item listed on [Minerals](https://minerals.dev) into your project.

    npx -y minerals@1 add arc/hero-section

It reads the item's record from minerals.dev, downloads the file from its supplier, checks it against the hash Minerals recorded, installs it (through shadcn when the project has a `components.json`, otherwise by writing the files the registry file names), and records the pull under `installed` in `minerals.json`. The last line it prints is the receipt.

Flags: `--overwrite` replaces files that already exist; `--allow-changed` goes on although a file differs from the recorded hash.

Exit codes: 0 done, 1 could not be done, 2 files that exist would change, 3 a file has changed since it was checked.

It sends nothing except the requests a pull needs: to minerals.dev for the record and the counted pull address, to the supplier for the file, and what shadcn itself fetches. No analytics, no update check.

Source: https://github.com/Mineralsdev/minerals/tree/main/cli (MIT)
