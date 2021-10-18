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

debugger;

const { createPeer } = require("minimal-ipfs");
const net = require("net")
const { _normalizeArgs, Socket } = net;

const { createDuplexToClient } = require("remote-worker-streams/worker");


let ipfs;
async function lazyPeer() {
  try {
    if (!ipfs) {
      ipfs = await createPeer();

      //We don't need to keep the connection in play, we can dial later for other protocols, just want a persistent connection like ipfs.swarm.connect, God willing.
      await ipfs.libp2p.dial(
        "/ip4/127.0.0.1/tcp/4003/ws/p2p/12D3KooWGEpMXtVT1rUZuACbjaE3mGz2jkzNdnJgM7eSfb5JVPVz"
      );
    }

    return ipfs;
  } catch (err) {
    debugger;
    console.log(err);
  }
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

      const socket = originalCreateConnection.call(this, options, cb);
      
      socket.on("error", (err) => {
        console.log(err);
      });

      return socket;

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

//TODO God willing: respond to CREATE_LIBP2P_CONNECTION, allow clients to handle the http(s) stuff, God willing.
self.addEventListener("message", function(e) {
  const { action, payload } = e.data || {};

  if (action === "CREATE_LIBP2P_CONNECTION") {
    const { readablePort, writablePort, options } = payload;
    const localSocket = createDuplexToClient(readablePort, writablePort);
    
    //TODO God willing: somehow handle any local calls by just calling the service worker via fetch and writing the stream, God willing?
    // not sure if we can get the full response stream that way, TGIMA. In that case, might want to have service worker just pass the stream directly from the host, God willing.
    // rather than returning a response like with a regular fetch, God willing.
    try {

      const remoteSocket = net.connect(options.port, options.host);
      
      localSocket.on("readable", async () => {
        const data = await localSocket.read();
        remoteSocket.write(data);
      })
      
      remoteSocket.on("readable", async () => {
        const data = await remoteSocket.read();
        localSocket.write(data);
      });

      remoteSocket.on('end', function() { 
        localSocket.destroy();
      });

      localSocket.on('end', () => {
        remoteSocket.destroy();
      })

      localSocket.on("error", (err) => {
        console.log("client side error", err);
      });

      remoteSocket.on("error", (err) => {
        console.log("remote side error", err);
      });
    
    } catch (err) {
      console.log(err)
    }
  }
})

self.postMessage({ action: "LIBP2P_READY" });