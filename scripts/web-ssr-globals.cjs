// Preloaded into every Node process the Expo CLI spawns. See ./expo.cjs.
//
// app.json sets web output to "server", so expo-router renders every route in
// Node. react-native-reanimated (a hard dependency of expo-router, so it is in
// the server bundle even though this app never animates with it) builds a
// FrameCallbackRegistryJS while it is still being imported, and its constructor
// queues UI work. Draining that queue calls react-native-worklets'
// flushUIQueue, which reaches for the browser global requestAnimationFrame, so
// the first server render dies with:
//
//   ReferenceError: requestAnimationFrame is not defined
//
// Nothing is animated during SSR, so a frame-clock shim is enough to let the
// routes render. Guarded because a browser (or a future Node that defines these
// itself) must keep its real implementation.

if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 16);
  globalThis.cancelAnimationFrame = (handle) => clearTimeout(handle);
}
