# Keylab 2

**Little hands, big adventures.**

A picture-led playground where a child chooses what to make, where to go, and what to discover. Nine forgiving games with big touch controls, useful keyboard input, original illustrations, gentle music, and a picture dock for switching adventures. The whole playroom fits one screen on tablets and phones.

**[Play Keylab 2 →](https://iowa69.github.io/keylab2/)**

![Choose a little adventure](docs/playroom.png)

## Pick a picture. Make an adventure.

| Adventure               | What the child makes happen                                                                                                                                                                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **My little garage**    | Build a car with five categories of parts and colors. Drive through six repeating worlds, greet friends, beep the horn, and toss bubbles, teddy bears, or confetti from the window.             |
| **Jungle dash**         | Explore five 3D toy islands, jump through rainbows, find seven kinds of treasures, and play peekaboo with five animal friends. Hear English letter associations as you discover things.         |
| **Space explorers**     | Steer a rocket through stars, asteroids, aliens, comets, and black-hole swirls. Collect six stars to visit one of eight planets, hear its name and a simple fact, then keep exploring.          |
| **The sweet shop**      | Make an ice cream with up to 18 scoops, a banana split, or chocolate. Choose eight flavors and eight toppings, including fish and pickles. Four friends react to what you make; Cat likes fish! |
| **Away we go!**         | Drag or tap friends into three themed train coaches or a plane. Collect and share favorite foods, bin silly poop, pet the meowing roof cat, and travel through changing scenery.                |
| **Discovery safari**    | Discover all 26 English letters with original pictures, count groups of one to five friends, and match six colors. Fill pages of a picture album.                                               |
| **Little music makers** | Tap or slide across a color piano, play three familiar traditional melodies one note at a time, listen, or make your own tune.                                                                  |
| **Mischief meadow**     | Aim playful sprays, wash and surprise animal friends, and change the pond's color and world. Includes water, bubbles, rainbow paint, and a cartoon wee surprise from behind a leafy screen.     |
| **Fruit picnic**        | Catch a pictured order of strawberries, oranges, or blueberries. Animated friends watch, blink, and celebrate as you feed Bear and begin another picnic.                                        |

Screenshots: [Jungle dash](docs/jungle-dash.png) · [The sweet shop](docs/sweet-shop.png) · [Space explorers](docs/space-explorers.png) · [Garage on a phone](docs/my-car-mobile.png).

Every game is available from the start. A local checkmark remembers an adventure the child has completed; it never locks or sells anything. Home is always in reach. No losing lives, countdown pressure, account, purchase, advertisement, or video popup.

### Controls

- **Choose:** tap a picture, click, or use keys **1–9** on the home screen. Arrow keys navigate focused game cards; Tab and Enter work too.
- **Play:** large picture buttons, taps, holds, and drags. Ordinary keyboard presses always give a useful action in a game. The runner and vehicles also provide directional controls.
- **Switch:** the picture dock changes games directly; the house returns to all nine pictures. Unfinished creations and journeys stay in place during the current session. Reloading starts fresh games.
- **Sound:** the speaker button toggles sound immediately. The games still work silently.
- **Settings:** hold the lock button for **2.5 seconds**, with a pointer or Space/Enter. A brief tap does not open settings.

The default **Little explorer** mode adds help with matching, catching, and steering. **I can do it!** leaves more of the aiming and matching to the child. The artwork, pictured goals, and repeated actions carry the game; reading is optional. Shared play with a grown-up is encouraged.

## Grown-up settings

Choose a name for greetings, assistance, volume, spoken English, calmer motion, stronger control outlines, and an optional rest after 5, 10, or 15 minutes of active game time. Games pause while another adventure is open, in settings, at a rest reminder, and when the tab is hidden. Time spent choosing games or in settings does not count. A grown-up starts fresh playtime after a reminder.

System reduced-motion preferences automatically enable calmer play. Fullscreen can be requested from settings where supported; Add to Home Screen is useful on phones and tablets. A website cannot lock browser or operating-system shortcuts.

The tunes are locally synthesized performances of **Twinkle, Twinkle, Little Star**, **Mary Had a Little Lamb**, and **Row, Row, Row Your Boat**. Guided piano play advances the melody with every key; free play gives each key a different note. Spoken English uses the browser's speech system, preferring an installed local English voice. Voice availability and offline speech depend on the voices installed on the device. Keylab adds no external speech service or recordings. Short horns, meows, splashes, and reactions are synthesized locally.

## Play on iPad

1. Open **[Keylab 2](https://iowa69.github.io/keylab2/)** in Safari.
2. Choose **Share → Add to Home Screen**, then launch its icon for the full play surface.
3. Tap a game to start. Portrait and landscape both work; touch starts the sound.
4. Hold the lock for 2.5 seconds to set a greeting name or adjust sound and assistance.

The same link works on desktop browsers, Android phones/tablets, and iPhone. It is an installable website, with no App Store download required.

## Offline and privacy

The production app precaches all games, the 3D engine, illustrations, icons, and bundled fonts. Open it once online and wait for **Ready for offline adventures** in settings. It can then reload and play offline. Preferences and a small collection of completed-adventure stamps stay in local storage on this device.

No analytics, account, microphone, camera, cookies, remote fonts, or third-party runtime requests. The hosting provider receives ordinary page requests when the website is loaded online.

Updates install in the background without forcing an active game to reload. Reopen or refresh the app to use an installed update; settings also shows a refresh button when an update is detected. When upgrading from an old version, let it finish updating, then close and reopen the app.

## Develop and check

Requires Node.js 22.12+ or 24+ and npm.

```bash
npm ci
npm run dev
```

```bash
npm test
npm run build
npx playwright install --with-deps chromium webkit firefox
npm run test:e2e
npm run format:check
```

Browser tests use the production preview, so build first. Service workers are disabled in development. Test offline behavior in the production preview on localhost or over HTTPS.

React handles the game chooser and illustrated games. Three.js renders Jungle dash, using procedural geometry, bounded scene objects, and a capped pixel ratio. A playable illustrated fallback uses the same runner model if WebGL is unavailable. Visited game components stay mounted to preserve play; inactive games stop advancing and drawing. The single 3D scene releases its resources when the application unmounts. Web Audio produces bounded, short musical feedback.

```text
src/
  App.tsx                 Child-owned chooser, navigation, pauses, saved stamps
  adventure/
    Art.tsx               Original reusable SVG characters and nine game pictures
    *Game.tsx             Purposeful game loops, pictures, and interaction
    VehicleGames.tsx      Garage building/driving and train/plane journeys
    runnerModel.ts        Independent 3D runner simulation
    ParentPanel.tsx       Protected preferences, rest, fullscreen, offline state
    audio.ts              Local tones and optional local-voice hints
    useGameKeys.ts        Shared forgiving keyboard handling
    usePlayTimer.ts       Scene timers that retain time across pauses
  playroom/
    settings.ts           Validated preferences and older-version migration
    offline.ts            Service-worker installation and updates
tests/playroom.spec.ts    Browser acceptance tests for five device/engine configurations
```

Automated checks cover real game completion and replay, keyboard after pointer input, navigation, pauses including moving artwork, preferences, small screens, and offline reloading. The suite runs Chromium desktop/mobile, Firefox, and WebKit with portrait/landscape iPad touch settings. Offline checks shut down a dedicated origin server and reload all nine games from the cache. These checks are not hands-on usability sessions with children or physical iOS/Android testing.

## Design and publishing

See [the game design notes](docs/GAME_DESIGN.md) and [visual/interaction references](docs/PLAY_REFERENCES.md) for the picture-first interaction rules and each game's purpose. Pushes to `main` run formatting, unit tests, a production build, and five browser/device configurations before publishing to GitHub Pages. No backend or secrets are required. Relative assets support the `/keylab2/` repository path.

## Credits and license

A standalone successor inspired by [Keylab](https://github.com/iowa69/keylab) and direct-play toddler toys. Original SVG illustrations and procedural 3D artwork; Nunito fonts; Lucide interface icons; React, Three.js, and Vite PWA.

Planet order and simple facts follow [NASA's planetary overview](https://science.nasa.gov/solar-system/planets/). The toy solar system is deliberately not to scale; the rocket visits planets rather than depicting landings on gas or ice giants. Music uses traditional public-domain melodies, without third-party recordings.

Copyright © 2026 Giovanni Lorenzin. All rights reserved. Made with love for Gabriel. See [LICENSE](LICENSE). Third-party packages retain their own licenses; Nunito uses the SIL Open Font License.
