# A little world the child can choose

The central rule is **see a purpose, do something, watch the result**. An attractive reaction is useful feedback; a delivered parcel, fed friend, visited planet, or newly opened island gives that reaction meaning.

The home screen is a toy shelf. Each whole illustration is a button, every game is available, and a large house always takes the child back. Settings belong to the grown-up; choosing an adventure belongs to the child.

## The nine loops

| Game       | Visible invitation                              | Action                                        | Meaningful result                                          | What comes next                               |
| ---------- | ----------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------- |
| Garage     | Empty workshop and pictured parts               | Choose body, paint, wheels; accelerate        | Your chosen car carries a parcel to a friend               | Drive again or build another                  |
| Runner     | Five empty star shapes and a road               | Steer, jump, collect                          | A rainbow gate opens                                       | A different 3D island                         |
| Space      | A chosen planet and three fuel stars            | Collect stars                                 | Rocket travels to that planet; its name and feature appear | Pick another world                            |
| Sweet shop | Friend asks for a pictured treat                | Add three scoops or pour chocolate, decorate  | The friend receives and eats your creation                 | Another friend to serve                       |
| Transport  | A train/plane and three empty passenger seats   | Board friends, then travel                    | Each friend arrives at their chosen destination            | Another trip or vehicle                       |
| Discovery  | A large pictured target                         | Match a letter, count a group, choose a color | A picture is added to an album                             | Complete three discoveries and turn the page  |
| Music      | Familiar song picture and highlighted piano key | Tap any key in guided mode                    | Each action plays the next real melody note                | Finish the song, choose another, or improvise |
| Splash     | Three friends with four mud patches each        | Hold and aim a hose or press keys             | Dirt disappears and clean friends run away                 | A clean parade and a new puddle               |
| Arcade     | Bear requests a pictured quantity of fruit      | Move basket or tap fruit                      | A complete basket can be served to Bear                    | Catch and count the next fruit                |

## Art direction

Warm cream paper, generous rounded shapes, restrained textured backgrounds, and original illustrated characters. Every tile shows the object the child will actually manipulate. Consistent smiling faces connect the workshop, food shop, planets, and music stage. Colors distinguish parts and controls without becoming the only way to identify a goal.

Use a large pictorial invitation before explanatory text. Progress uses real repeated objects, missing shapes, or washed-off mud as well as numbers. Celebrations stay in the game and make the changed world visible; they do not interrupt with advertising, reward screens, locked content, or modal popups.

The runner uses actual 3D depth, rounded toy geometry, recognizable landmarks, gentle bumps, and an endless sequence of short achievable journeys. Other games use responsive SVG rather than flattening everything into the same renderer.

## Playability rules

- A child can choose and change games without opening grown-up settings.
- Pointer controls make the pictured action happen. A selected paint or part visibly changes the creation.
- A random key nudges the current task forward. Directional keys offer more control where it helps.
- A pointer click must not accidentally disable later keyboard play.
- Matching offers an inviting hint after a mismatch. Little-explorer mode supplies help after exploration.
- Missing an arcade catch recycles the fruit. Runner obstacles bounce; no death screen or penalties.
- Completion stays long enough to understand and offers an obvious continuation.
- Touch controls remain reachable on small screens; Home stays visible during scrolling.
- Pause stops simulation, sound, and scene animation. Navigation releases timers and rendering resources.
- No required reading, timed failures, unlock grind, account, ads, purchases, or external video.

## Review approach

Separate implementation passes covered vehicle games, 3D/splash engineering, and learning/arcade design. Independent review checked visible purpose, keyboard/pointer continuity, small-screen layout, pauses, replay, and silent play. Found issues—focus lost after a brief parent-button tap, movement continuing during pause, and Home scrolling away—were corrected before release.

Automated browser scenarios complement visual inspection. They cannot establish that every child understands the pictures unaided. A useful next observation is a shared play session: let the child choose freely, watch where they hesitate, and change that specific invitation or response.
