# Lancer NHP Toolkit

Lancer NHP Toolkit is a Foundry VTT add-on for the `lancer` system that helps run a small set of NHP-related mechanics directly from chat cards and world macros.

The current release focuses on:

- `Memetic Spark`
- `Transmuting Spark`
- Transcendence die tracking
- OSIRIS gate tracking

The goal of this module is to reduce manual actions and bookkeeping at the table.

## Compatibility

- Foundry Virtual Tabletop: generation 11 and 12
- Game system: `lancer`

## Features

- Creates world macros for currently supported actions.
- Tracks actor state with Foundry flags so Transcendence Die and Osiris Gate progress persist.
- Uses chat cards with action buttons for resolving damage and state progression.
- Counts active NHP systems on the actor to scale `Memetic Spark`.
- Handles transcendent state activation and end-state flow from chat cards.

## Included Macros

- `Memetic Spark`
- `Transmuting Spark`
- `Hurl Into the Duat`

## Installation

Install through Foundry using the manifest URL, or install manually if you prefer.

Manifest URL:

`https://github.com/ncl52391/lancer-nhp-toolkit/releases/latest/download/module.json`

1. Download the release ZIP from GitHub.
2. Extract it into your Foundry `Data/modules/` directory.
3. Confirm the extracted folder is named `lancer-nhp-toolkit`.
4. Restart Foundry VTT.
5. Enable **Lancer NHP Toolkit** in a Lancer world.

## Usage

### First-Time Setup

1. Enable the module in your Lancer world.
2. Find the created macros in the macro directory.
3. Drag the macros to the hotbar if desired.

### Memetic Spark

1. Select the acting token.
2. Target one or more tokens.
3. Run the `Memetic Spark` macro.
4. Targets apply damage via the chat card.

Damage is based on the number of active NHP systems on the actor, with an additional bonus while Transcendent.

### Transmuting Spark

1. Select the acting token.
2. Target one or more tokens.
3. Run the `Transmuting Spark` macro.
4. Targets apply damage via the chat card.

### Hurl Into the Duat

After using the Hurl Into the Duat Quick Tech Action:

1. Select the acting token.
2. Run the `Hurl Into the Duat` macro.
3. Click the button on the chat card to move to the next step if the tech action was successful.

## Temporary Art Credits

The current placeholder ability icons are human-made icons from Game-icons.net and are used under CC BY 3.0:

- `memetic-spark.png`: "Psychic waves" by Lorc
- `transmuting-spark.png`: "Unstable orb" by Lorc
- `hurl-into-the-duat.png`: "Portal" by Lorc

### Sources

- https://game-icons.net/1x1/lorc/psychic-waves.html
- https://game-icons.net/1x1/lorc/unstable-orb.html
- https://game-icons.net/1x1/lorc/portal.html

### License

- https://creativecommons.org/licenses/by/3.0/

## License

GPL-3.0-only
