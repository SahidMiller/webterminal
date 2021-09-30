//TODO God willing: worker starts somewhere. 

// this worker vs other workers spawned later, God willing,  on command.
// I guess having a worker in node-stackify isn't a problem by using webpack.
//  -- tangentially, I wonder if we can intercept and require something else for worker, God willing.

// generically speaking, providing methods to run here, God willing.
// and so before running this, it's url probably gets passed to child_process on main thread to instantiate this either as a shell or a bootstrap.
// subsequent threads created (on main thread or not) can also use this, God willing or others, God willing.
// still probably through child_process, God willing.
// import { executeUserEntryPoint } from "node-stackify/node"

// try {
//   //TODO God willing: make sure when running this that it catches stuff (vm.runInThisContext)
//   // might want to do something about vm.runInContext so that this actually run before worker?
//   executeUserEntryPoint(process.argv.slice(2))
// } catch (err) {
  
// }

//Event listener/Bootstrap
// get command, read/write port, fsProxyPort, dimensions, (pid, uid, gid, ppid, God willing), stdout/inIsTTY
// build fsProxy from port
// bootstrap fs module and globalThis.fs (could just set as global and reexport global for all later imports, God willing)
// set globalThis.window to globalThis although running code with window may be a big issue, TGIMA.
// import stream based stuff (uses process which relies on fs and even itself via events. TGIMA)
// create stdin/stdout streams from ports.
// set stdin/stdou columns as rows and isTTY, God willing.
// import libp2p to bootstrap libp2p networking, God willing.
// import executables to bootstrap getting executables from path, God willing. (since command is assumed not to be expanded? TGIMA)
// import TTY and set messagePort to use (also set to global)

//Execute command
// create process from streams.
// set fs for process, God willing, to global (set in from bootstrap)
// override modules like console to do other shit, God willing.
// get all builtins and set Module._builtinModules for this and set all globally except for crypto
// for crypto, have to use ProvidePlugin on babel to scope this out, God willing.
// getArgs from command (argv including actual script location)
// setup exitPromise to listen to process.exit (TODO God willing: work on error handling within loader and also listening for events/streams to close out ourselves, God willing)
// use argv[1] (first is node since we're in js env.) to input to node.executeUserEntryPoint
// await process.exit (TODO God willing, same as above)
// write to stdout on error and destroy stdout when done to signal to other end to close, God willing.
// Praise be to The God, Master of the Universe.

// pass complete argv including expanded path and/or cwd, God willing.
// since all processes are node js like processes, God willing.
// but just like 'ls', needs to be in env or cwd, God willing, for worker/process to execute?
// 

import bootstrapProcess from "node-stackify/child_process/bootstrap-worker"
import { bootstrap as bootstrapFs } from "./fs-proxy.cjs"

bootstrapProcess({
  bootstrapFs: function(fsProxyPort) {
    return bootstrapFs(fsProxyPort);
  },
  afterProcess: async function() {
    //TODO God willing: setup libp2p for http(s) by fetching libp2p.config and setting up http(s) or net or tls modules, God willing
    const { bootstrap: bootstrapRouter } = await import("../../utils/setupLibp2pRouter.js");
    await bootstrapRouter;
  },
});