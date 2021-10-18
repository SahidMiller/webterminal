import { Server, Socket, normalizeServerArgs } from "@network-stackify/stack/nets/generic/index.js"
import { codes } from "@network-stackify/stack/utils/errors.js";
import { options } from "preact";
import { createDuplexToClient } from "remote-worker-streams/worker";

const { ERR_INVALID_ARG_VALUE } = codes;

import { debuglog } from "util"
let debug = debuglog("net", (fn) => {
  debug = fn;
});

function ServiceWorkerServer(options, requestListener) {
  if (!(this instanceof ServiceWorkerServer)) return new ServiceWorkerServer(options, requestListener);
  Server.call(this, options, requestListener);
}

Object.setPrototypeOf(ServiceWorkerServer.prototype, Server.prototype);
Object.setPrototypeOf(ServiceWorkerServer, Server);

ServiceWorkerServer.prototype.internalListen = function(options, cb) {

  if (!("port" in options)) {
    throw new ERR_INVALID_ARG_VALUE(
      "options",
      options,
      'must have the property "port"'
    );
  }

  this._options = options;

  const { port1: serverListener, port2: transferServerListener } = new MessageChannel();

  self.postMessage({ 
    action: "CREATE_SERVER", 
    payload: {
      port: options.port,
      host: options.host,
      messagePort: transferServerListener
    },
    transferables: [transferServerListener]
  }, [transferServerListener]);
  
  const _self = this
  serverListener.onmessage = function(e) {
    const { action, payload } = e.data || {};
    if (action === "NEW_CONNECTION") {
      const { readablePort, writablePort } = payload;
      const stream = createDuplexToClient(readablePort, writablePort);
      _self.addConnection(stream)
    }
  }

  this.listening = true;
  process.nextTick(() => this.emit("listening"));
};

ServiceWorkerServer.prototype.internalAddress = function() {
  if (this.listening) {
    return { family: "sw", port: this._options.port, host: this._options.host };
  }

  return null;
};

function createServer(options, connectionListener) {
  return new ServiceWorkerServer(options, connectionListener);
}

export { ServiceWorkerServer as Server, createServer, normalizeServerArgs };
