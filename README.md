# Lancer NHP Toolkit

Lancer NHP Toolkit is a Foundry VTT add-on for the `lancer` system that helps run a small set of NHP-related mechanics directly from chat cards and world macros.

The current release focuses on:

- `Memetic Spark`
- `Transmuting Spark`
- `Hurl Into the Duat`
- Transcendence die tracking
- OSIRIS gate tracking

The goal is to reduce manual bookkeeping at the table while keeping the workflow easy to understand for players and GMs.

## Compatibility

- Foundry Virtual Tabletop: generation 11 and 12
- Game system: `lancer`

This module is intended for Lancer worlds only. If enabled outside the Lancer system, it will refuse to run its gameplay macros.

## Features

- Creates ready-to-use world macros for the currently supported actions.
- Tracks actor state with Foundry flags so Transcendence and OSIRIS gate progress persist.
- Builds chat cards with action buttons for resolving damage and state progression.
- Applies AP damage directly from chat card buttons.
- Counts active NHP systems on the actor to scale `Memetic Spark`.
- Handles Transcendent state activation and end-state flow from chat.

## Included Macros

On first launch in a Lancer world, the module creates these world macros if they do not already exist:

- `Memetic Spark`
- `Transmuting Spark`
- `Hurl Into the Duat`

Existing macros with the same names are left untouched.

## Installation

### Manifest URL

Install through Foundry's module installer with:

`https://github.com/ncl52391/lancer-nhp-toolkit/releases/latest/download/module.json`

### Manual Install

1. Download the release ZIP from GitHub.
2. Extract it into your Foundry `Data/modules/` directory.
3. Confirm the extracted folder is named `lancer-nhp-toolkit`.
4. Restart Foundry VTT.
5. Enable **Lancer NHP Toolkit** in a Lancer world.

## Usage

### First-Time Setup

1. Enable the module in your Lancer world.
2. Let the GM client finish loading.
3. Find the created world macros in the macro directory.
4. Drag the macros to the hotbar if desired.

### Memetic Spark

- Select the acting token.
- Target one or more tokens.
- Run the `Memetic Spark` macro.
- Use the chat card buttons to apply the generated AP damage to each target.

Damage is based on the number of active NHP systems on the actor, with an additional bonus while Transcendent.

### Transmuting Spark

- Select the acting token.
- Target one or more tokens.
- Run the `Transmuting Spark` macro.
- Apply damage from the chat card.

This macro also decreases the tracked Transcendence die unless the actor is already Transcendent. When the die reaches minimum, the chat card offers a button to enter a Transcendent state.

### Hurl Into the Duat

- Select the acting token.
- Run the `Hurl Into the Duat` macro.
- Resolve the hit from the chat card.

The module tracks the current OSIRIS gate on the actor, advances it on a successful hit, and provides a reset button for rest or Full Repair handling.

## Notes

- State is stored on the actor using Foundry flags under this module's id.
- Damage application assumes the expected Lancer actor data structure for HP and armor.
- Only users with permission to act on the relevant actor or token can use the action buttons.

## Known Scope

This module currently supports a focused subset of Lancer NHP mechanics. It is not a full automation layer for every NHP- or Iconoclast-related interaction.

Future versions may expand support, but this README only documents the features that are implemented in the current codebase.

## Development

1. Copy this folder into your Foundry `Data/modules/` directory.
2. Restart Foundry VTT.
3. Enable **Lancer NHP Toolkit** in a Lancer world.

## Releasing

1. Update the version in `module.json`.
2. Commit and push your changes.
3. Create and push a matching tag such as `v1.0.1`.
4. GitHub Actions will build `lancer-nhp-toolkit.zip` and attach it, along with `module.json`, to the GitHub release.

## Support

- Repository: [ncl52391/lancer-nhp-toolkit](https://github.com/ncl52391/lancer-nhp-toolkit)
- Issues: [GitHub Issues](https://github.com/ncl52391/lancer-nhp-toolkit/issues)

## Temporary Art Credits

The current placeholder ability icons are human-made icons from Game-icons.net and are used under CC BY 3.0:

- `memetic-spark.png`: "Psychic waves" by Lorc
- `transmuting-spark.png`: "Unstable orb" by Lorc
- `hurl-into-the-duat.png`: "Portal" by Lorc

Sources:

- https://game-icons.net/1x1/lorc/psychic-waves.html
- https://game-icons.net/1x1/lorc/unstable-orb.html
- https://game-icons.net/1x1/lorc/portal.html

License:

- https://creativecommons.org/licenses/by/3.0/

## License

GPL-3.0-only
