const { createWriterToWorker, createReaderToWorker } = require("remote-worker-streams/client");

//TODO God willing: write a custom Read/WriteStream class (inheriting regular straem I assume, God willing)
//  From there, basically open it 
class ProxyReadStream {
  constructor(fdOrPath, options) {
    // const isFd = typeof fdOrPath === 'number'
    // const isPath = typeof fdOrPath === 'string';
    
    // if (!isFd && !isPath) {
    //   throw "invalid path or file descriptor";
    // }

    // //Can resolve path/open via xhr, God willing, then see if >2
    // if (isFd && fdOrPath >= 2) {
    //   throw "TTY ReadStream only supports fd <= 2"
    // } 
    // const handleRegexes = [
    //   /dev\/tty[0-2]/,
    //   /dev\/fd\/[0-2]/,
    //   /dev\/pts\/[0-9]+/
    // ];

    // if (isPath && !handleRegexes.find(regex => regex.test(fdOrPath)) ) {
    //   throw "TTY ReadStream only supports /dev/tty, /dev/fd/[0-2] and /dev/pts/[0-99] paths"
    // }
    
    if (!ProxyReadStream.messagePort) {
      throw "Message port to parent thread was not set";
    }

    //TODO God willing: return a read stream directly to the terminal.
    // might have this passed in, attached somewhere global, TGIMA.
    const [readableToClient, writablePort] = createReaderToWorker();

    ProxyReadStream.messagePort.postMessage({ action: "CREATE_TTY_READ_STREAM", payload: { writablePort, path: fdOrPath, options } }, [writablePort]);
    
    readableToClient.on('finish', () => {
      readableToClient.destroy(null, () => {
        readableToClient.emit("close");
      });
    })

    return readableToClient
  }
}

class ProxyWriteStream {
  constructor(fdOrPath, options) {
    if (!ProxyWriteStream.messagePort) {
      throw "Message port to parent thread was not set";
    }

    const [writableToClient, readablePort] = createWriterToWorker();
    
    ProxyWriteStream.messagePort.postMessage({ action: "CREATE_TTY_WRITE_STREAM", payload: { readablePort, path: fdOrPath, options } }, [readablePort]);
    
    writableToClient.on('finish', () => {
      writableToClient.destroy(null, () => {
        writableToClient.emit("close");
      });
    })

    return writableToClient
  }
}

//TODO God willing: need to make sure this reflects per process!
function isatty(fd) {
  //TODO God willing: if fd is a copy of tty does that count? TGIMA.
  // Not sure what else could be checked, God willing.

  //Reserving 3 for /dev/tty and actual stdin/stdout, God willing.
  if (fd === 3) {
    return true
  }

  if (fd > 2) {
    return false
  }

  if (fd === 0) {
    return globalThis.process.stdin.isTTY;
  }

  if (fd === 1) {
    return globalThis.process.stdout.isTTY;
  }

  if (fd === 2) {
    return globalThis.process.stderr.isTTY;
  }
}

ProxyReadStream.messagePort = null;
ProxyWriteStream.messagePort = null;

module.exports = { ReadStream: ProxyReadStream, WriteStream: ProxyWriteStream, isatty }