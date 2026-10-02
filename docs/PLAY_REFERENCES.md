# Play and platform references

Reviewed October 2026. These references informed interaction choices; the game's SVG drawings and procedural 3D objects are original. No screenshots, illustrations, audio recordings, or characters were copied into the app.

- [Sago Mini World](https://sagomini.com/world/): an open-ended world in which animal friends react to food, travel, and imaginative experiments. Keylab uses visible reactions and repeatable play rather than timed failures.
- [Pok Pok — developer's App Store description](https://apps.apple.com/us/app/pok-pok-montessori-preschool/id1550204730) and [Shops](https://playpokpok.com/blog/a-new-toy-in-the-playroom-shops-9953f179bae1/): tactile manipulation, expressive handmade toys, and exploration without pressure. Keylab makes the object itself tappable, with a tap alternative for drags.
- [WebKit: Safari 13.1 features](https://webkit.org/blog/10247/new-webkit-features-in-safari-13-1/): Pointer Events unify mouse, touch, and pen. Games use pointer capture for dragging and release/cancel handling.
- [Apple: desktop-class browsing on iPad](https://developer.apple.com/videos/play/wwdc2019/203/): audio and interactions need to respect browser gesture requirements. Audio is unlocked from real user input.
- [WebKit: Home Screen web apps](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/): a standalone web manifest and local icons support Safari's Add to Home Screen. Keylab needs no push notifications or account.
- [Playwright browser documentation](https://playwright.dev/docs/browsers): automated WebKit checks cover the browser engine and touch layouts, but are not a substitute for physical iPad/Safari testing.
- [NASA: planets](https://science.nasa.gov/solar-system/planets/): planet order and short factual descriptions. The illustrated journeys compress distances and treat gas giants as fly-by visits.

Our design judgment: one visible action and an immediate, friendly consequence make a useful starting point for shared toddler play.
