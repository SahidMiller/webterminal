import { Socket } from "@network-stackify/stack/nets/generic/index.js"
import { createDuplexToWorker } from "remote-worker-streams/client"

/**
 * Convert async iterator stream to socket
 * @param {Object} options options.stream: required to convert to a socket
 * @returns {Socket} socket like class using underlying stream
 */
function ServiceWorkerSocket(options) {
  if (!(this instanceof ServiceWorkerSocket)) return new ServiceWorkerSocket(options);
  Socket.call(this, options);
}

Object.setPrototypeOf(ServiceWorkerSocket.prototype, Socket.prototype);
Object.setPrototypeOf(ServiceWorkerSocket, Socket);

// port <number> Required. Port the socket should connect to.
// host <string> Host the socket should connect to. Default: 'localhost'.
// localAddress <string> Local address the socket should connect from.
// localPort <number> Local port the socket should connect from.
// family <number>: Version of IP stack. Must be 4, 6, or 0. The value 0 indicates that both IPv4 and IPv6 addresses are allowed. Default: 0.
// hints <number> Optional dns.lookup() hints.
// lookup <Function> Custom lookup function. Default: dns.lookup().
ServiceWorkerSocket.prototype.internalConnect = async function(options) {
  try {
    //TODO God willing: connect to service worker with our options serialized, God willing.
    // we can setup a port prior to any particular connection (possibly even passed in)
    // as long as it reaches, God willing, our libp2p worker.
    // we also want our own message ports for reading/writing, God willing.
    this._options = options;

    //TODO God willing: use port and host to find out what protocol to use or do this in the worker side, God willing.
    // possibly use different lookup functions in the future like DNS, God willing. but then that would be local to the app.
    const [duplex, readablePort, writablePort] = createDuplexToWorker();
    const { port, host, localAddress, localPort, family, hints, lookup } = options;

    self.postMessage({ 
      action: "CREATE_LIBP2P_CONNECTION", 
      payload: { 
        readablePort, 
        writablePort,
        options: { port, host, localAddress, localPort, family }
      },
      transferables: [readablePort, writablePort]
    }, [ readablePort, writablePort ]);

    this.stream = duplex;
    
    this.stream.on("data", (data) => {
      this.push(data)
    });
    
    this.stream.on("end", () => {
      this.push(null);
    })

    process.nextTick(() => this.emit("connect"));

  } catch (err) {
    this.destroy(err);
  }
}

/**
 *
 * @param {*} multiaddr multiaddress of libp2p proxy
 * @param {*} proto p2p protocol name
 * @returns
 */
 function connect(...args) {
  const normalized = _normalizeArgs(args);
  const [options] = normalized;

  if (options.timeout) {
    socket.setTimeout(options.timeout);
  }

  const socket = new ServiceWorkerSocket(options);
  return socket.connect(normalized);
}


export { ServiceWorkerSocket as Socket, connect, connect as createConnection };
