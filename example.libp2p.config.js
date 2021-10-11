//TODO God willing: fetch with file-loader and store in files.
// I guess fetch this from file so users can edit it easily, God willing.
// So filewatcher perhaps... or like a cached or nativemodule.
// might depend if used globally or with a similar short lived module at runtime.
// ooh, file utility on nodejs backend to update listeners/p2p on go-ipfs by manually checking the api, God willing.
// so user can edit and save and have go-ipfs updated to forward, God willing. Might even have a proxy within it just to filter out ips/peerids, God willing.

// module.exports = {
//   "*.yarnpkg.com": {
//     peerId: "",
//     protocol: "/x/yarnpkg/",
//   },
//   "*.npmpkg.com": {
//     peerId: "",
//     protocol: "/npmpkg/",
//   },
//   //Fallback
//   "*": {
//     //Not sure what options could be available in general besides peerId, God willing.
//     // just need an existing connection, God willing, or create a new connection before routing, God willing.
//     // not sure if multiaddr is enough to eventually get a peerId, God willing, like a dnsaddr or just fetching from any cors enabled endpoint, God willing.
//     peerId: "",
//     dnsaddr: "sahidmiller.com",
//     multiaddr: "/dns4/localhost/tcp/443/ws/p2p/",
//     protocol: "/x/",

//     //Might be possible to forward over an existing connection? TGIMA.
//   },
// };

const { createPeer } = require("minimal-ipfs");
const { _normalizeArgs, Socket, normalizeServerArgs } = require("net")
const { Server: HttpServer } = require("http");
const { Server: HttpsServer } = require("https");

let ipfs;
async function lazyPeer() {
  if (!ipfs) {
    ipfs = await createPeer();

    //We don't need to keep the connection in play, we can dial later for other protocols, just want a persistent connection like ipfs.swarm.connect, God willing.
    await ipfs.libp2p.dial(
      "/ip4/127.0.0.1/tcp/4003/ws/p2p/12D3KooWGEpMXtVT1rUZuACbjaE3mGz2jkzNdnJgM7eSfb5JVPVz"
    );
  }

  return ipfs;
}

module.exports.bootstrap = lazyPeer();

//TODO God willing: so let's have minimal-ipfs saved by name and keep this in fs.
//TODO God willing: routing per application as well, God willing?
//TODO God willing: definitely since might not even be a libp2p connection in the long run, The God is most aware.
// for example, routing to a stream for a particular app and perhaps particular site in an app or just a particular domain, God willing.
const routing = {
  "table": {  
    "registry.npmjs.org": {
      proto: "/x/npm"
    },
    "github.com": {
      proto: "/x/github"
    },
    "codeload.github.com": {
      proto: "/x/codeload"
    },
    "raw.githubusercontent.com": {
      proto: "/x/rawcontent"
    },
    "registry.yarnpkg.com": {
      proto: "/x/yarnpkg"
    },
    "raspberrypi.local": {
      proto: "/x/pi"
    }
  },
  //TODO God willing: help inherit if there is a match.
  "inherit": {
    multiaddr: "/ip4/127.0.0.1/tcp/4003/ws/p2p/12D3KooWGEpMXtVT1rUZuACbjaE3mGz2jkzNdnJgM7eSfb5JVPVz"
  },
  //TODO God willing: help set few things if there isn't a match.
  "default": undefined
}


//Override all net connections to subvert http(s) and custom connections (non-prototype connect won't work since es6 based and this runs way after binding to es6 connect)
const originalCreateConnection = Socket.prototype.connect;
Socket.prototype.connect = function (...args) {
  let normalized;
  // If passed an array, it's treated as an array of arguments that have
  // already been normalized (so we don't normalize more than once). This has
  // been solved before in https://github.com/nodejs/node/pull/12342, but was
  // reverted as it had unintended side effects.
  if (Array.isArray(args[0])) {
    normalized = args[0];
  } else {
    normalized = _normalizeArgs(args);
  }

  const [options, cb] = normalized;
  const { path, port, host } = options;

  const tableEntry = routing.table[host];
  const defaultEntry = routing.default;
  const inheritEntry = routing.inherit;

  //TODO God willing: if host/port/path is a match, then pass to some libp2p and if not, perhaps either another net or regular fetch? TGIMA.
  // literally could fake http manually tbh... TGIMA. similar to service workers by fetching and creating our own responses, God willing.
  if (tableEntry || defaultEntry) {
    options.libp2p = ipfs.libp2p;
    options.multiaddr = tableEntry ? tableEntry.multiaddr || inheritEntry.multiaddr : defaultEntry && defaultEntry.multiaddr;
    options.proto = tableEntry ? tableEntry.proto || inheritEntry.proto : defaultEntry && defaultEntry.proto;

    try {
      return originalCreateConnection.call(this, options, cb);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  //TODO God willing: can we use the normal http(s)-browserify to do XHR/fetch as if it was http, God willing.
  // when libp2p isn't used, God willing.
  // I guess an issue here is that this is net, not http. So The God is most aware.
  // So implementing something in http specific to working with net would be interesting, God willing.
  throw new Error("No libp2p entry exists");
};

const { createDuplexToClient } = require("remote-worker-streams/worker");

//TODO God willing: possibly try to hook the server so somehow, God willing, we can connect to it from the outside, God willing.
//since this is tcp like, God willing, and listening over libp2p
//God willing, another app can connect to this libp2p instance, God willing.
//Right now we can invert it probably, God willing, so that another app can connect.
function listen(type = "http", ...args) {
  
  const [options, callback] = normalizeServerArgs(args);

  //TODO God willing: setup proper protocols
  if (Number(options.port) === 8001) {
    options.protocol = "/api";
  }

  if (Number(options.port) === 8002) {
    options.protocol = "/gateway";
  }

  //TODO God willing: allow service worker to connect by sending a dedicated signal / port, God willing.
  // as opposed to listening to all
  const { port1: serverListenPort, port2: serverTransferPort } = new MessageChannel();

  self.postMessage({ 
    action: "CREATE_SERVER", 
    payload: {
      port: options.port,
      protocolName: options.protocol,
      protocol: type,
      //TODO God willing: ignore for now but can do similar things as IPNS with domain names, God willing.
      // others might collaborate by also hosting same IPNS like structure on their domains
      host: options.host,
      messagePort: serverTransferPort
   }, 
   transferables: [serverTransferPort]
  }, [serverTransferPort]);

  
  serverListenPort.onmessage = (e) => {
    //TODO God willing: create stream for the new connection using payload
    const { action, payload } = e.data || {};

    if (action === "NEW_CONNECTION") {
      const socket = createDuplexToClient(payload.readablePort, payload.writablePort);

      this._connections++;
      socket.server = this;
      socket._server = this;

      this.emit("connection", socket);
    }
  }

  options.libp2p = ipfs.libp2p;
  return [options, callback]
}

const originalHttpsListen = HttpsServer.prototype.listen;
HttpsServer.prototype.listen = function(...args) {
  return originalHttpsListen.apply(this, listen.call("https", ...args));
}

const originalHttpListen = HttpServer.prototype.listen;
HttpServer.prototype.listen = function(...args) {
  return originalHttpListen.apply(this, listen.call(this, "http", ...args))
}
