//TODO God willing: not sure what to inherit from, God willing.
//ReadStream/WriteStream require a stream if they inherit from socket, God willing.
//So perhaps socket layer is basically handled by the polyfill to figure out which is which similar to how 
// socket already tries to differentiate unix from tcp sockets, God willing?
const { createWriterToWorker, createReaderToWorker } = require("remote-worker-streams/client");
const { Duplex } = require("stream");

//TODO God willing: need to make sure this reflects per process!
function isTTY(fd) {
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

function validateFdOrPath(fdOrPath) {
  const isFd = typeof fdOrPath === 'number'
  const isPath = typeof fdOrPath === 'string';
  
  if (!isFd && !isPath) {
    throw "invalid path or file descriptor";
  }

  //Can resolve path/open via xhr, God willing, then see if >2
  if (isFd && fdOrPath >= 2) {
    throw "TTY ReadStream only supports fd <= 2"
  } 
  const handleRegexes = [
    /dev\/tty[0-2]/,
    /dev\/fd\/[0-2]/,
    /dev\/pts\/[0-9]+/
  ];

  if (isPath && !handleRegexes.find(regex => regex.test(fdOrPath)) ) {
    throw "TTY ReadStream only supports /dev/tty, /dev/fd/[0-2] and /dev/pts/[0-99] paths"
  }
}

function TTY(fd) {

  Duplex.call(this);
  
  if (fd === 0 || fd === 3) {
    this.tty = new ProxyReadStream(fd, { readMessagePort: TTY.readMessagePort });
    
    this.tty.on("readable", async () => {
      const data = await this.tty.read();
      this.push(data);
    })

  } else if (fd === 1 || fd === 2) {
    this.tty = new ProxyWriteStream(fd, { writeMessagePort: TTY.writeMessagePort });
  }
}

TTY.prototype._read = function() {}

TTY.prototype._write = function(chunk, enc, done) {
  this.tty.write(chunk, enc, done);
}

TTY.prototype._destroy = function(cb) {
  this.tty && this.tty.destroy(cb);
}
TTY.setWindowSize = function({ columns = 65, rows = 100 } = {}) {
  TTY.prototype.columns = columns;
  TTY.prototype.rows = rows;
}

Object.setPrototypeOf(TTY.prototype, Duplex.prototype);
Object.setPrototypeOf(TTY, Duplex);

TTY.prototype.getWindowSize = function(windowSizeBuffer) {
  windowSizeBuffer[0] = this.columns || 65
  windowSizeBuffer[1] = this.rows || 100
  return
}

TTY.prototype.setRawMode = function() {
}

TTY.prototype.setBlocking = function() {
}

class ProxyReadStream {
  constructor(fdOrPath, options) {
    options = options || {};

    // validateFdOrPath(fdOrPath);

    if (!options.readMessagePort) {
      throw "options.readMessagePort is required";
    }

    //TODO God willing: return a read stream directly to the terminal.
    // might have this passed in, attached somewhere global, TGIMA.
    const [readableToClient, writablePort] = createReaderToWorker();

    options.readMessagePort.postMessage({ 
      action: "CREATE_TTY_READ_STREAM", 
      payload: { writablePort, path: fdOrPath },
      transferables: [writablePort]
    }, [writablePort]);
    
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
    options = options || {};

    // validateFdOrPath(fdOrPath);

    if (!options.writeMessagePort) {
      throw "options.writeMessagePort is required";
    }

    const [writableToClient, readablePort] = createWriterToWorker();
    
    options.writeMessagePort.postMessage({ 
      action: "CREATE_TTY_WRITE_STREAM", 
      payload: { readablePort, path: fdOrPath },
      transferables: [readablePort]
    }, [readablePort]);
    
    writableToClient.on('finish', () => {
      writableToClient.destroy(null, () => {
        writableToClient.emit("close");
      });
    })

    return writableToClient
  }
}

module.exports = { TTY, isTTY }

// process.stdin._handle.asyncReset
// process.stdin._handle.getAsyncId
// process.stdin._handle.getProviderType

// process.stdin._handle.close
// process.stdin._handle.hasRef
// process.stdin._handle.ref
// process.stdin._handle.unref

// process.stdin._handle._externalStream
// process.stdin._handle.bytesRead
// process.stdin._handle.bytesWritten
// process.stdin._handle.fd
// process.stdin._handle.isStreamBase
// process.stdin._handle.onread
// process.stdin._handle.readStart
// process.stdin._handle.readStop
// process.stdin._handle.setBlocking
// process.stdin._handle.shutdown
// process.stdin._handle.useUserBuffer
// process.stdin._handle.writeAsciiString
// process.stdin._handle.writeBuffer
// process.stdin._handle.writeLatin1String
// process.stdin._handle.writeQueueSize
// process.stdin._handle.writeUcs2String
// process.stdin._handle.writeUtf8String
// process.stdin._handle.writev

// process.stdin._handle.constructor
// process.stdin._handle.getWindowSize
// process.stdin._handle.setRawMode

// process.stdin._handle.reading