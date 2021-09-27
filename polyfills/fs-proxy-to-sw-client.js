const { create } = require("web-worker-proxy");

const serviceWorkerController = globalThis.navigator && globalThis.navigator.serviceWorker && globalThis.navigator.serviceWorker.controller;

/**
 *  fs like proxy to service worker
 */
module.exports = serviceWorkerController && create(serviceWorkerController);