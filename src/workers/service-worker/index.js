const { SW_ACTIVATED } = require("./actions.js");
const { notifyAll } = require("./notify");
const { createFsProxy, createSyncResponse } = require("../proxy-fs/host/index.js");

const fs = require("fs");
globalThis.fs = fs;

const { bootstrap:bootstrapFiles } = require("../../utils/setupFiles.cjs");
bootstrapFiles()

self.addEventListener("install", function (e) {
  self.skipWaiting();
  console.log("[ServiceWorker] Installed");
});

self.addEventListener("activate", function (e) {
  //TODO God willing: send to clients that a new process created, God willing.
  //keep history, God willing.
  console.log("[ServiceWorker] Activated");

  notifyAll((all) => ({
    action: SW_ACTIVATED,
    clientCount: all.length,
  }))
});

self.addEventListener("message", async function handler(event) {
  const { action, payload } = event.data || {}

  if (action === "PING") {
    notifyAll(() => ({
      action: "PONG"
    }))
  }
  
  if (action === "CREATE_FS_PROXY") {
    const fsProxyPort = payload;
    createFsProxy(fsProxyPort);
  }
});

self.addEventListener("fetch", async function (e) {
  const url = new URL(e.request.url)

  if (url.host !== self.location.host) return;

  if (url.pathname === "/fs") {
    
    e.respondWith(createSyncResponse(e));
  }
});