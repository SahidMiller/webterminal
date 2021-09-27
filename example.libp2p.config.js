//TODO God willing: fetch with file-loader and store in files.
// I guess fetch this from file so users can edit it easily, God willing.
// So filewatcher perhaps... or like a cached or nativemodule.
// might depend if used globally or with a similar short lived module at runtime.
// ooh, file utility on nodejs backend to update listeners/p2p on go-ipfs by manually checking the api, God willing.
// so user can edit and save and have go-ipfs updated to forward, God willing. Might even have a proxy within it just to filter out ips/peerids, God willing.

module.exports = {
  "*.yarnpkg.com": {
    peerId: "",
    protocol: "/x/yarnpkg/",
  },
  "*.npmpkg.com": {
    peerId: "",
    protocol: "/npmpkg/",
  },
  //Fallback
  "*": {
    //Not sure what options could be available in general besides peerId, God willing.
    // just need an existing connection, God willing, or create a new connection before routing, God willing.
    // not sure if multiaddr is enough to eventually get a peerId, God willing, like a dnsaddr or just fetching from any cors enabled endpoint, God willing.
    peerId: "",
    dnsaddr: "sahidmiller.com",
    multiaddr: "/dns4/localhost/tcp/443/ws/p2p/",
    protocol: "/x/",

    //Might be possible to forward over an existing connection? TGIMA.
  },
};
