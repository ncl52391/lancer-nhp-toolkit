# Lancer NHP Toolkit

Automation and tracking tools for Lancer NHP mechanics in Foundry VTT, including Iconoclast talents and Hurl Into the Duat support.

This module targets the `lancer` system and is intended for Foundry VTT generations 11 and 12.

## Installation

Install via Foundry using this manifest URL:

`https://github.com/ncl52391/lancer-nhp-toolkit/releases/latest/download/module.json`

## Included Macros

On first launch in a Lancer world, the module creates these world macros if they do not already exist:

- `Memetic Spark`
- `Transmuting Spark`
- `Hurl Into the Duat`

Existing macros with the same names are left untouched.

## Development

1. Copy this folder into your Foundry `Data/modules/` directory.
2. Restart Foundry VTT.
3. Enable **Lancer NHP Toolkit** in a Lancer world.

## Releasing

1. Update the version in `module.json`.
2. Commit and push to GitHub.
3. Create and push a matching tag like `v1.0.0`.
4. GitHub Actions will build `lancer-nhp-toolkit.zip` and attach it, along with `module.json`, to the GitHub release.

## License

GPL-3.0-only
