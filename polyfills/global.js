if (!globalThis.SharedArrayBuffer) {
  globalThis.SharedArrayBuffer = ArrayBuffer;
}

module.exports = globalThis;
