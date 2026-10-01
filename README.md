# Keylab 2

**Touch. Smash. Smile.**

An instant, full-screen sensory playroom for babies and toddlers to explore together with a grown-up. Open the app and there is already something to play with. Touch it, drag it, swipe across it, or press a handful of keys.

**[Open the playroom →](https://iowa69.github.io/keylab2/)**

![Bubble sea, ready for little hands](docs/playroom.png)

There is no homepage to navigate, no reading required, no on-screen typing exercise, no score, no right answer, and no reward ladder. A touch makes something happen. The introductory hint disappears after the first interaction. Toy selection and preferences live behind a grown-up gate.

## The toy box

| Toy                 | What little hands can do                                                                                       |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Bubble sea**      | Hold and move a big bubble. Tap to pop it and release a smiling fish. Bubbles gently replenish.                |
| **Bouncy friends**  | Pick up, drag, throw, and bounce soft shapes. They tumble into each other with gravity and elastic collisions. |
| **Rainbow ribbons** | Paint flowing ribbons with multiple fingers. Keyboard presses paint big colorful swirls.                       |
| **Peekaboo**        | Open an egg with a tap or any key. A fox, bunny, or bear peeks out, then gently hides again.                   |
| **Little growers**  | Sprinkle water over little seeds. A few touches grow a smiling flower. Touch a grown flower to start again.    |
| **Star song**       | Wake sleeping stars to hear pentatonic notes. Sweep between stars to join them with light.                     |

All toys accept touch and arbitrary keyboard input. Swiping and dragging are real interactions, not just substitutes for clicking buttons. Scroll-wheel input also makes a response. There is no automatic toy switching.

## Grown-up controls

Hold **Grown-ups** in the top-right corner for three seconds, then answer **7 + 5**. A brief tap does not open a menu. Keyboard users can Tab to the control and hold Space or Enter.

- **Baby mode:** larger objects, fewer bubbles, generous touch targets, and flowers that bloom in two actions. The default.
- **Toddler mode:** a little more to explore, with more bubbles, smaller objects, and an extra flower-growing step.
- **Gentle sounds:** a distinct plop, boing, or musical note for each toy. Audio is synthesized locally, rate-limited, and compressed. Start with your device volume low; software cannot guarantee the physical loudness of speakers or headphones.
- **Calmer movement:** removes ambient drifting and swaying and reduces particles. The toys still respond to direct play. System reduced-motion preferences enable this automatically.
- **High contrast:** dark backgrounds with predominantly white and red toys.
- **A little break:** optional reminders after 5, 10, or 15 minutes of active play. A sleepy screen pauses the toy. A grown-up resumes it through the gate. Time in settings or a hidden tab does not count.
- **Fullscreen:** a grown-up can request fullscreen where supported. On mobile, Add to Home Screen gives the toy more room.

The gate protects in-app controls. **A website cannot lock browser or operating-system controls.** Guided Access on iPhone/iPad or app pinning on Android provide device-level boundaries. Escape and other system keys may still leave browser fullscreen. This is a digital toy for shared play, not a claim about developmental or medical benefits.

## Offline and privacy

No accounts, ads, analytics, cameras, microphones, cookies, remote fonts, or third-party runtime requests. Preferences are saved in local storage on this device. The hosting provider still receives ordinary requests when the website loads online.

The production build precaches the app, illustrations, icons, and locally bundled fonts. Load it once online; the grown-up panel reports when it is ready offline. There are no external image or audio dependencies.

New versions install in the background. An active session is not forcibly reloaded. Reopen or refresh the page to use an installed update; the grown-up settings also offer a refresh when an update is detected. If upgrading from the original Keylab 2, allow the update to install and refresh again, or close the old tab and reopen the app.

## Develop

Requires Node.js 22.12+ or 24+ and npm.

```bash
npm ci
npm run dev
```

```bash
npm run build       # TypeScript check + production build
npm run preview     # Production preview, including offline support
npm test            # Physics, toy behavior, resource bounds, preferences
npx playwright install chromium
npm run test:e2e    # Real desktop/mobile browser tests; build first
npm run format:check
```

Service workers are disabled in development. Test offline behavior with the production preview on localhost or HTTPS.

## How it works

React handles the small grown-up interface. A custom Canvas 2D engine handles the entire play surface, with original procedural illustrations, direct multi-pointer manipulation, collision physics, trails, and bounded particles. Web Audio generates the sounds. Vite PWA handles offline caching. Nunito and DM Sans are bundled locally; interface icons come from Lucide.

```text
src/
  App.tsx                    Full-screen play, protected controls, break state
  playroom/
    CanvasPlayroom.tsx       Canvas lifecycle, keyboard/touch/wheel, active time
    engine.ts               Toy behavior, physics, multi-touch, resource limits
    render.ts               Original procedural illustration and animation
    GrownUps.tsx             Parent gate, toy box, and preferences
    ToyIcon.tsx              Toy-box illustrations
    settings.ts             Validated local preferences and migration
    sound.ts                Bounded, locally synthesized feedback
    offline.ts              Installation and update handling
tests/playroom.spec.ts       Desktop/mobile browser acceptance tests
```

Objects, trails, trail points, particles, and simultaneous pointers have explicit upper bounds. Held-key repeat events are ignored. Physics time steps are bounded, coincident objects are separated, and cancelled touches release their objects. Pixel density is capped at 2×. Animation stops when the tab is hidden; play pauses while grown-up controls are open.

Tests cover immediate play in every toy, bubble replenishment, drag/throw, continuous painting, multi-touch cancellation, repeated flower growth, long key storms, rotation, high-contrast rendering, reduced motion, the grown-up gate, settings persistence, breaks, and a real offline reload. Browser tests run in Chromium, including mobile emulation. They are not a substitute for hands-on usability testing with children, or testing on physical Safari/Android devices.

## Publish

Pushes to `main` run formatting, unit tests, a production build, and browser tests before deploying to GitHub Pages. No backend or secret configuration is required. Relative assets support the `/keylab2/` repository path and regular static hosting.

## Credits and license

A standalone companion to [Keylab](https://github.com/iowa69/keylab). The interaction direction takes inspiration from direct sensory play apps such as [BabyScroll](https://babyscroll.app/); all artwork and implementation here are original.

Copyright © 2026 Giovanni Lorenzin. All rights reserved. Made with love for Gabriel. See [LICENSE](LICENSE). Third-party packages retain their own licenses; Nunito and DM Sans are distributed under the SIL Open Font License.
