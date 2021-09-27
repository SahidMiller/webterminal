import git from "isomorphic-git";
import stream from "stream";
import isoGitHttp from "isomorphic-git/http/node";
import EventEmitter from "events";

//TODO God willing: somewhat similar to the bash interpreter.
function createChildProcess(asyncFn) {
  const process = new EventEmitter();

  Object.assign(process, {
    stdin: new stream.Writable({
      write: function (chunk, encoding, next) {
        console.log(chunk.toString());
        next();
      },
    }),
    stdout: new stream.Readable({
      read: function (n) {
        // sets this._read under the hood
      },
    }),
    stderr: new stream.Readable({
      read: function (n) {
        // sets this._read under the hood
      },
    }),
  });

  asyncFn
    .then((ret) => {
      process.stdout.push(ret);
      process.stdout.push(null);
      process.emit("close", 0);
    })
    .catch((ex) => {
      process.stderr.push(ex.stack.toString());
    });

  return process;
}

function spawnGit(args) {
  switch (args[0]) {
    case "ls-remote":
      return createChildProcess(
        git
          .getRemoteInfo({
            http: isoGitHttp,
            url: args[2],
          })
          .then((remoteInfo) => {
            const ref = args[3];
            const headsRef = remoteInfo[ref].split("/").slice(2).join("/");
            const value = remoteInfo.refs.heads[headsRef];

            return `ref: ${remoteInfo[ref]} ${ref}\n${value} ${ref}`;
          })
      );
    default:
      break;
  }
}

function spawnNode(program, args, { cwd, env, stdio, detached, shell }) {
  //TODO God willing: basically run this program from this cwd, God willing.
}

export default {
  exec: () => {
    debugger;
  },
  spawn: (program, args, opts) => {
    debugger;
    const argv = program.split("");

    //TODO God willing; similar to readline?
    if (program === "git") {
      return spawnGit(args);
    }

    if (argv[0] === "node") {
      return spawnNode(argv[1], args, opts);
    }
  },
};
