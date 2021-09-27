//TODO God willing: either a CLI for libp2p management
// or starting and stopping, God willing, or just watching the file and making sure to update net.

//Maybe this is somewhat like a service?
const libp2p = require("minimal-libp2p");
const fs = require("fs");

async function setup() {
  //Setup libp2p-hosts if it doesn't exist
  if (!fs.existsSync("/etc/libp2p-hosts.config.js")) {
    const libp2pConfigUrl = await import(
      "!file-loader!../example.libp2p.config.js"
    );

    const libp2pConfigSource = await fetch(libp2pConfigUrl);
    fs.writeFileSync(
      "/etc/libp2p-hosts.conf.js",
      await libp2pConfigSource.text()
    );
  }
}

//Setup resolver for dns addresses, God willing.
const { dnsaddrResolver } = require("multiaddr/src/resolvers");
const originalDial = libp2p.dial.bind(libp2p);
const originalDialProtocol = libp2p.dialProtocol.bind(libp2p);

libp2p.dial = () => {};

libp2p.dialProtocol = () => {};

//Assuming node-stackify has libp2p-net?
const net = require("node-stackify/net");
//TODO God willing: Update create connection and/or agent.createConnection and/or globalAgent.createConnection
// maybe prototypes as well, God willing, so we can parse urls according to already resolved dns addresses AND/OR according to the /etc/libp2p-hosts.config.js, God willing.

//TODO God willing: might be possible to use regular fetch here and do the libp2p stuff in a service worker, God willing.
net.createConnection;

setup();
