# A little world the child can choose

The central rule is **see a purpose, do something, watch the result**. Delivering a treat, greeting an animal, opening a rainbow, or visiting a planet gives each reaction meaning. The child chooses the adventure and can return to an unfinished creation.

The home screen is a nine-picture toy shelf. During play, a picture dock switches games directly and Home returns to the shelf. The app fits one viewport, including iPad portrait and landscape. Settings require a grown-up's deliberate hold.

## The nine loops

| Game       | Visible invitation                        | Action and result                                                                              | Continuing discovery                                                           |
| ---------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Garage     | A custom car and pictured parts           | Choose shape, paint, wheels, roof toy and sticker; drive, greet, beep and throw toys           | Six cycling worlds; change the car whenever you wish                           |
| Runner     | A toy road, treasures and a hiding friend | Steer, jump and peek; spoken pictures connect objects to letters                               | Five treasures open a rainbow to the next of five worlds                       |
| Space      | A planet destination and six empty stars  | Drag the rocket, dodge or bounce off hazards, collect stars and greet aliens                   | A planet visit says its name and a simple fact; eight choices remain available |
| Sweet shop | An expressive customer and ingredients    | Tap or drag flavors and toppings into a cone, split or chocolate; serve and watch the response | Tall creations, unusual toppings and another friend to feed                    |
| Transport  | Three large illustrated coach windows     | Drag or tap friends into seats; collect food and offer it to a passenger                       | Different tastes, changing scenery, a meowing cat and a bin for silly finds    |
| Discovery  | A pictured letter, group or color         | Match the picture or explore with helpful hints                                                | All 26 letters, numbers one to five, six colors and album pages                |
| Music      | A song picture and highlighted piano key  | Tap, slide or press keys for the next melody note; listen or improvise                         | Three familiar tunes and free play                                             |
| Splash     | Muddy, expressive animal friends          | Aim and hold a spray; color or clean the scene and make friends react                          | Different spray tools, changing ponds and fresh mud                            |
| Picnic     | Bear's pictured fruit order               | Move the basket or tap falling fruit; count and serve                                          | Moving friends and an endless sequence of new picnics                          |

## Art and interaction

Warm cream paper, rounded shapes, generous picture buttons and original illustrated characters connect the games. The runner uses actual 3D toy geometry; the other games use responsive SVG. Objects should look like the action they offer: a flavor is a scoop, a passenger is a draggable face, a planet is a recognizable world.

The picture carries the invitation; short English words reinforce it. A baby can experiment without reading. Touch has a tap alternative wherever a precise drag would be difficult. Random ordinary keys move the activity forward, while arrows provide more deliberate steering. A sound toggle is always reachable, and visual responses remain meaningful without sound.

The mischievous yellow spray uses a fully clothed cartoon character obscured below the waist by a leafy screen. Its response is brief surprise and silly color, with water available to clean the characters again. The drawings contain no anatomical detail.

## Engineering and playability rules

- Every game is available immediately. There are no lives, countdown failures, advertisements, purchases or locked levels.
- A part, ingredient or spray must visibly change the world. A taller dessert must still show each addition.
- Gentle bumps preserve progress. Missed fruit returns; unwanted food produces an expressive response and another chance.
- Taps and drags must not disable later keyboard input. Home restores focus to a visible game picture.
- Switching games preserves the current session's work. Inactive games stop simulation, drawing, timers and CSS motion.
- Pointer cancellation, tab hiding and settings must release held controls. Audio stops immediately when muted or paused.
- Speech queues retain at most one upcoming discovery. Deliberate greetings and replay buttons can interrupt it.
- Art and interactive scene objects stay bounded during endless play. A single 3D scene is retained and cleaned up when the app unmounts.
- Progress is stored only where explained: settings and keepsake stamps persist on the device; unfinished game scenes last for the current session.

## Review and validation

Separate implementation passes covered vehicles, runner/space, and food/meadow/picnic. Independent reviewers played the games and checked touch use, visible consequences, preserving work, and pause behavior. Review fixes included hidden Home focus targets, sparse-passenger food selection, pointer press movement in Firefox, portrait car cropping, overlapping controls, and the representation of large desserts.

Browser checks cover Chromium desktop/mobile, Firefox, and WebKit in two iPad orientations. Shared checks exercise the chooser, real game actions, keyboard after pointer input, speech fallback, settings, pauses, and small screens. Offline tests warm a dedicated origin, stop its server, and reload/play all nine cached adventures.

These are engineering and design checks; physical iPad use and shared play with a child remain separate observations. During a shared session, watch which invitation causes hesitation and adjust that particular picture or response.

See [the research references](PLAY_REFERENCES.md) for the inspiration and platform documentation.
