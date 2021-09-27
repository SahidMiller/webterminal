import * as node from "node-stackify/node";
import loader from "node-stackify/module";

import Process from "../../polyfills/ProcessClass.js";
import getBinExecutables from "../utils/executables.js";
import console from "console";

//TODO God willing: don't start/load whatever we're running until this we get our stdout, God willing.

function getArgs(command) {
  //TODO God willing: if first arg is a path, then use that directly, God willing.
  const argv = command.split(" ");
  const exeName = argv.length && argv[0];
  const matchingExePaths = getBinExecutables(exeName).filter(
    (exePath) => exePath === exeName || exePath.split(path.sep).pop() === exeName
  );;

  //TODO God willing: run the first executable path using module, God willing? if .js or #!/bin/node ? TGIMA.
  const firstExePath = matchingExePaths[0];
  const firstArg = firstExePath || "/bin/bash";

  //If default (echo, ls, etc.) then include the command.
  //If not, then don't include the command since converted to path.
  const args = firstExePath ? argv.slice(1) : argv;
  return ["node", firstArg, ...args];
}

function getBuiltins(additional = {}) {
  //TODO God willing: somehow get module require to get builtins without using "externals"
  // since umd applies to node environments and checks for exports
  return {
    //Webpack and regular
    events: require('events'),
    fs: fs,
    path: require("path"),
    child_process: require("child_process").default,
    module: loader.Module,
    url: require("url"),
    readline: require("readline"),
    util: require("util"),
    assert: require("assert"),
    stream: require("stream"),
    os: require("os"),
    buffer: require("buffer"),
    crypto: require("crypto"),
    zlib: require("zlib"),
    vm: require("vm"),
    http: require("http"),
    https: require("https"),
    querystring: require("querystring"),
    worker_threads: {},
    constants: require("constants"),
    Buffer: require("buffer").Buffer,
    "graceful-fs": fs,
    //Yarn
    net: require("net"),
    tls: require("tls"),
    dns: require("dns"),
    ...additional,
  };
}

export default async function execute(command, stdin, stdout) {
  const process = new Process(stdin, stdout, stdout);
  process.fs = globalThis.fs

  const _console = {
    ...console,
    log: (...data) => {
      process.stdout.write(data.join(",") + "\n");
    },
  };

  const builtins = getBuiltins({ process, console: _console, tty: globalThis.tty });
  loader.Module._builtinModules = builtins;

  const updatedBuiltins = { ...builtins };
  delete updatedBuiltins.crypto;

  Object.assign(globalThis, updatedBuiltins);

  process.argv = getArgs(command);
  const entry = process.argv[1];

  const exitPromise = new Promise((res, rej) => {
    process.on("exit", (code) => {
      return code === 0 || typeof code === "undefined" ? res() : rej();
    });
  });

  try {
    //Assume the tool writes to process.stdin? TGIMA.
    node.executeUserEntryPoint(entry);
    await exitPromise;
  } catch (err) {
    if (err) {
      process.stdout.write(err + "\n");
    }
  } finally {
    process.stdout.destroy();
  }
}
