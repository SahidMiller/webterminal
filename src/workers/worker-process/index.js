//TODO God willing: either run a piece of code as the entry point which requires the real entry point, God willing.
// or someway to hook into entry point logic to add code to load via fs.
import bootstrapProcess from "node-stackify/child_process/bootstrap-worker"
import { bootstrap as bootstrapFs } from "./fs-proxy.cjs"

bootstrapProcess({
  bootstrapFs: function(fsProxyPort) {
    return bootstrapFs(fsProxyPort);
  },
  afterProcess: async function() {

  },
  beforeExecution: async function({ Module }) {
    //TODO God willing: Load a dynamic libp2p router file before starting
    //TODO God willing: use path variables for finding configuration before checking default locations.
    //TODO God willing: default locations may just be default PATH variables.
    //TODO God willing: some kind of .bashrc file which we run in /bin/bash on startup if found, God willing.
    //console.log("Neither a dynamic libp2p module or configuration file was found! Using default built in PATH");

    //TODO God willing: might ignore bin/bash for this or run this only in specific whitelist, God willing.
    try {
      const { bootstrap } = Module._load("/etc/libp2p-hosts.conf.js")
      await bootstrap;

    } catch (err) {
      console.log(err);
    }
  }
});