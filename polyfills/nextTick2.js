const oldNextTick = require("./nextTick.js");

module.exports = function nextTick(handler, ...args) {
  if (queueMicrotask) {
    queueMicrotask(() => handler(...args));
    return;
  } else {
    return oldNextTick(...args);
  }
};
