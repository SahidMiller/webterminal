import { createPeer } from "minimal-ipfs";
import net, { _normalizeArgs } from "net";

const Socket = net.Socket;

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

export const bootstrap = lazyPeer();

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