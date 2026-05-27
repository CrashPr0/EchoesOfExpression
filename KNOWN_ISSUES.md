# Known Issues & Findings

## Stable Baseline
Commit `e3dae0a` ("Complete Rework to be 90% done") is the last confirmed stable state.
The only confirmed-safe change on top of it is the `play-on-click` fix below.

---

## What Works

### play-on-click scoped to entity (confirmed stable)
`play-on-click` was binding to `window` click, so any tap anywhere triggered the video.
Fixed by binding to `this.el` instead — video only plays when the user taps the video plane in AR.

---

## What Crashes

### Root cause pattern
The 8th Wall SLAM engine (`xr-slam.js` WASM) is extremely sensitive to anything that
touches the render loop or memory allocation during its initialization window (~2s after load).
Every crash below traces back to this.

### animation-mixer
Adding a custom `animation-mixer` A-Frame component with a `tick` function causes the
8th Wall SLAM WASM to abort with `RuntimeError: Aborted(native code called abort())`.
The "Oops, something went wrong" screen appears via `xrextras-runtime-error`.
Crash happens ~2 seconds in, before any models have loaded.
Suspected cause: tick functions registered on multiple entities interfering with SLAM timing.

### Deferred model loading
Replacing hardcoded `gltf-model` attributes with a `deferred-gltf-model` component
(to defer loading until GPS proximity) causes the `xrextras-loading` screen to hang
indefinitely. 8th Wall's loading overlay appears to wait for `model-loaded` events
that never fire when loading is deferred.

### Renderer config changes
Removing `logarithmicDepthBuffer: true`, removing `antialias: true`, or lowering
`camera far` from 10000 causes an immediate crash on iOS.
The 8th Wall engine's shaders appear to require these specific renderer settings.
**Do not change the renderer or camera config.**

### Moving video into `<a-assets>`
Placing the 79MB MP4 inside `<a-assets>` blocks scene rendering until the video loads,
causing out-of-memory crashes on mobile. Keep the video in a hidden `<div>` outside
the scene with `preload="metadata"`.

---

## Known Warnings (harmless)
These appear in logs on every load and can be ignored:
- `XR has been renamed to XR8` — 8th Wall deprecation, no impact
- `webvr-polyfill: Invalid timestamps detected` — iOS/WebVR polyfill quirk, no impact
- `THREE.WebGLRenderer: .useLegacyLights deprecated` — Three.js r155 cosmetic warning

---

## Outstanding Issues (not yet fixed)
- Models are not animated (animation-mixer crashes the app)
- Teleport button is overridden by next GPS update (state check mismatch)
- North alignment broken at exactly 0° heading (falsy check on webkitCompassHeading)
- GPS watcher never cleared on component removal (memory leak)
- GPS status UI stuck at "Checking GPS..."
