# Night Circuit — project context

Multiplayer race game for 1031f.com. One host opens a room, everyone else joins
with a four-letter code from their own device, host drops the lights, cars run,
random winner gets a celebration.

## Layout

```
race-game/
├─ web/night-circuit.html          # whole frontend, single file, no build step
├─ src/main/java/.../RaceRoomController.java
└─ CLAUDE.md
```

The frontend is deliberately one file — no bundler, no framework. If that stops
being true, it should be a decision, not a drift.

## The two things that are easy to break

**1. The sync seam.** All multiplayer goes through one adapter interface:

```
createRoom(code)
getRoom(code)  -> { meta, cars: [...], state } | null
putCar(code, car)
clearCars(code)
putState(code, state)
```

Three drivers implement it — `LocalNet` (localStorage + BroadcastChannel,
same-browser only), `RestNet` (needs `CONFIG.apiBase`), `ArtifactNet` (Claude
artifact storage). Driver is auto-selected at load; the header pill shows which.
Anything new (WebSocket, SSE, Firebase) implements these five methods and
nothing else in the app changes. Do not let game logic reach past this seam and
touch `fetch` or `localStorage` directly.

**2. The race is deterministic, not simulated.** When the host hits Lights out,
it rolls `finishTime`, `amp`, `waves`, `phase` per car **once**, writes them into
shared state, and every client integrates the identical pace curve
(`buildCurve` / `progressAt`) from a shared `startAt` timestamp. That's why all
screens show the same overtakes and the same winner with no server tick.

If you ever call `Math.random()` inside the animation loop, or recompute the
grid client-side, the screens desync. The randomness lives in `startRace()` only.

`progressAt` integrates a strictly-positive speed function so progress never
reverses — cars must not appear to drive backwards. Keep `amp < 1`.

## Theming

Every colour, font, and the corner-chamfer size live in the `:root` token block
at the top of the `<style>`. Nothing below it hardcodes a value. Retheming to
match 1031f.com = replacing those tokens. Car colours are the `LIVERIES` array
in JS — eight entries, one per lane, and eight is the hard cap because that's
how many lanes fit the track geometry.

Track geometry note: the lane paths are stadium shapes whose start point is
always `x = 300` regardless of inset, which is why the start/finish line can be
a straight vertical bar. Don't change `stadium()` without rechecking that.

## Known open items

- Four-letter room codes are guessable. Public deploy wants a rate limit on
  `PUT /rooms/{code}` or codes get squatted.
- Polling is 1.8s, so joiners take a beat to show on the host's grid.
  WebSocket/STOMP would fix it and fits the existing adapter shape.
- `startAt` is wall-clock, so a device with a badly wrong clock races desynced.
  Serving a time offset from the backend would harden it.
- Rooms are in-memory with a 6h sweep. Restart drops live races. Fine for now.
- CORS in the controller is pinned to 1031f.com.

## Conventions

- Copy is sentence case, active voice, no exclamation marks. Buttons name the
  thing that happens ("Lights out", "Run it again").
- Reduced motion is respected; keyboard focus is visible. Keep it that way.
