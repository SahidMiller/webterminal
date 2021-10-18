const { SW_ACTIVATED } = require("./actions.js");
const { notifyAll } = require("./notify");
const { createFsProxy, createSyncResponse } = require("../proxy-fs/host/index.js");
const { createDuplexToWorker } = require("remote-worker-streams/client");
const http = require("http");
const net = require("net");
const fs = require("fs");
globalThis.fs = fs;

const path = require("path");
globalThis.path = path


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

let serversByPort = {}, serversByHost = {};

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

  if (action === "CREATE_SERVER") {
    const { messagePort, host, port } = payload || {};
    serversByPort[port] = { messagePort, host, port }
    serversByHost[host] = serversByHost[host] || {};
    serversByHost[host][port] = { messagePort, host, port }
  }
});

const isLocalhost = self.location.hostname === "localhost";

self.addEventListener("fetch", async function (e) {
  const url = new URL(e.request.url)

  //TODO God willing: save any fetched files from static/ipfs host to this fs
  const isRequestLocal = self.location.hostname === url.hostname;
  
  if (isRequestLocal && url.pathname === "/fs") { 
    return e.respondWith(createSyncResponse(e));
  } else if (url.pathname.startsWith("/http") && fs.existsSync(url.pathname.slice(5))) {
    const filePath = url.pathname.slice(5);

    //TODO God willing: use legit http-server or shim for hosting in sw (use a cmd)
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, "index.html")
      
      if (fs.existsSync(indexPath)) {
        return e.respondWith(new Response(fs.readFileSync(indexPath)))
      } else {
        var init = { "status" : 404 , "statusText" : "File does not exist." };
        return e.respondWith(new Response(undefined, init));
      }

    } else {
      return e.respondWith(new Response(fs.readFileSync(filePath)));
    }
  }

  let matchPort
  let pathname = url.pathname;
  
  //When the request matches the service worker host, try to match the first path with ports
  if (isRequestLocal) {
    const firstPath = (url.pathname && url.pathname.split("/")[1])
    matchPort = serversByPort[firstPath];
    if (matchPort) pathname = url.pathname.slice(firstPath.length + 1);
  } else {
    const serversForHost = serversByHost[url.hostname] || {};
    matchPort = serversForHost[url.port];
  }

  if (matchPort) {
    const { messagePort, host, port } = matchPort;
    const requestUrl = url.origin + pathname;

    //TODO God willing: write our request after sending ports to server, God willing.
    e.respondWith(new Promise((resolve, reject) => http.request(requestUrl, { 
      headers: { ...(Object.fromEntries(e.request.headers)), "user-agent": "" },
      method: e.request.method,
      host: host,
      port: port,
      path: pathname,
      createConnection: (opts) => {
        
        //readablePort = reader for request (which we write to here)
        //writablePort = writer for response (which we read here)
        const [duplex, readablePort, writablePort] = createDuplexToWorker();
        messagePort.postMessage({ action: "NEW_CONNECTION", payload: { readablePort, writablePort } }, [readablePort, writablePort]);
        return duplex
      } 
    }, function(res) {
      let chunks = [];
      res.on("data", function(data) {
        chunks.push(data);
      });
      res.on("end", function() {
        
        const response = new Response(Buffer.concat(chunks), { 
          status: res.statusCode, 
          statusText: res.statusMessage,
          headers: new Headers(res.headers) 
        });
        
        try {
          res.destroy();
        }finally {
          resolve(response);
        }
      })
    }).end())); 
  }
});