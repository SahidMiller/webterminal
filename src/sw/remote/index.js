const { SW_ACTIVATED } = require("../client/useServiceWorker")
const { notifyAll } = require("./notify");
const { createDuplexToClient, createReaderToClient } = require("../../utils/remote-streams-worker");
const { FS_REQUEST_SUCCEEDED, FS_REQUEST_FAILED } = require("../../utils/fs-proxy-client");
const { default: fsProxyHost } = require("../../utils/fs-proxy-host");
const { default: createWorkerInMainThread } = require("./create-worker-thread.js");
const { default: createReadline } = require("../../utils/create-readline.js");
const { default: completeExecutables } = require("../../utils/complete-executables.js");

const fs = require("fs");

const { bootstrapPath } = require("../../utils/executables.js");
const { bootstrap:bootstrapFiles } = require("../../utils/setupFiles.js");
const { proxy } = require("web-worker-proxy");
bootstrapFiles().then(bootstrapPath);

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
  const { action, payload } = event.data || {};

  if (action === "CREATE_WRITE_STREAM") {
    const { readablePort, path } = payload;
    const readable = createReaderToClient(readablePort);
    readable.pipe(fs.createWriteStream(path));
  }

  if (action === "CREATE_READ_STREAM") {
    const { writablePort, path } = payload;
    const writable = createReaderToClient(writablePort);
    fs.createReadStream(path).pipe(writable);
  }

  if (action === "GET_COMPLETIONS") {
    const messagePort = payload;
    
    messagePort.onmessage = function(event) {
      const { id, action, payload } = event.data;

      if (action === "GET_COMPLETIONS") {
        let result;

        try {
          //TODO God willing: also complete when starting with / (complete path, God willing)
          // and also when no slash so could be executable or path in current directory, God willing.
          result = completeExecutables(payload);
        } catch (err) {
          console.log(err);
          result = [[], payload]
        }

        messagePort.postMessage({ id, action: "COMPLETION_SUCCESS", payload: result });
      }
    }
  }

  if (action === "CREATE_FS_PROXY") {
    proxy(fs, payload);
  }

  if (action === "CREATE_READLINE_INTERFACE") {
    const { readablePort, writablePort, messagePort } = payload;
    const duplex = createDuplexToClient(readablePort, writablePort);
    createReadline(duplex, createWorkerInMainThread(messagePort), { 
      //TODO God willing: also complete when starting with / (complete path, God willing)
      // and also when no slash so could be executable or path in current directory, God willing.
      completer: completeExecutables 
    });
  }
});

self.addEventListener("fetch", async function (e) {
  const url = new URL(e.request.url)

  if (url.host !== self.location.host) return;

  if (url.pathname === "/fs") {
    

    e.respondWith(e.request.json()
      .then((json) => { data = json; return fsProxyHost(json); })
      .then(res => {
        let response
        try {
          response = JSON.stringify({ action: FS_REQUEST_SUCCEEDED, payload: res });
        } catch (err) {
          //Unserializable response
          response = JSON.stringify({ action: FS_REQUEST_SUCCEEDED, payload: undefined, unserializable: true });
        }

        return new Response(response, { status: 200 });
      })
      .catch(err => {
        console.log(FS_REQUEST_FAILED, err, data);
        let response 
        try {
          response = JSON.stringify({ action: FS_REQUEST_FAILED, payload: err });
        } finally {
          return new Response(response || "unknown error", { status: 500 });
        }
      })
    )
  }
});