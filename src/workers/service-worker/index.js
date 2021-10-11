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

let protocols = {};

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
    const { protocolName = "/", messagePort, host, port } = payload || {};
    
    //TODO God willing: add an event listener to fetch and create a new connection, God willing;
    const libp2pProtocol = protocolName && protocolName[0] === "/" ? protocolName : "/" + protocolName;
    protocols[libp2pProtocol] = { messagePort, host, port }
  }
});

self.addEventListener("fetch", async function (e) {
  const url = new URL(e.request.url)

  //TODO God willing: can also do the reverse and save any fetched files from static/ipfs host to this fs
  if (url.hostname !== "127.0.0.1" && url.hostname !== self.location.hostname) return;

  const firstPath = "/" + (url.pathname && url.pathname.split("/")[1])

  if (protocols[firstPath]) {
    const { messagePort, host, port } = protocols[firstPath];
    const pathname = (firstPath === "/gateway" ? url.pathname.slice(firstPath.length) : url.pathname);
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

        resolve(response);
      })
    }).end()));

  } else if (url.pathname === "/fs") { 
    e.respondWith(createSyncResponse(e));
  } else if (url.pathname.startsWith("/http") && fs.existsSync(url.pathname.slice(5))) {
    const filePath = url.pathname.slice(5);

    //TODO God willing: use legit http-server or shim for hosting in sw (use a cmd)
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      const indexPath = path.join(filePath, "index.html")
      
      if (fs.existsSync(indexPath)) {
        return e.respondWith(new Response(fs.readFileSync(indexPath)))
      } else {
        var init = { "status" : 404 , "statusText" : "File does not exist" };
        return e.respondWith(new Response(undefined, init));
      }

    } else {
      return e.respondWith(new Response(fs.readFileSync(filePath)));
    }
  }
});