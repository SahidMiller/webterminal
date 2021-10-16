//TODO God willing: either run a piece of code as the entry point which requires the real entry point, God willing.
// or someway to hook into entry point logic to add code to load via fs.
import bootstrapProcess from "node-stackify/child_process/bootstrap-worker"
import { bootstrap as bootstrapFs } from "./fs-proxy.cjs"

bootstrapProcess({
  bootstrapFs: function() {
    //TODO God willing: use file system for bootstrapping anything for /bin/bash new process, God willing.
    //TODO God willing: check if the executable exists now rather than later since it might spawn /bin/bash.
    //TODO God willing: remove assumption of using fs proxy, God willing, from child_process or try monkey patching?
    // we can try to run /bin/node or something else which then runs the command and sets things up.
    // we just save as /bin/node and run that and it can handle postMessage, God willing? 
    // also could try generic onMessage here where we just require the transferables of the payload to be listed, God willing.
    const { port1: fsProxyPort, port2: transferFsProxyPort } = new MessageChannel();
    self.postMessage({ action: "CREATE_FS_PROXY", payload: transferFsProxyPort, transferables: [transferFsProxyPort] }, [transferFsProxyPort])

    return bootstrapFs(fsProxyPort);
  },
  afterProcess: async function(process) {
    //TODO God willing: move to .bashrc
    process.env.YARN_REGISTRY = "https://registry.npmjs.org"
  }
});