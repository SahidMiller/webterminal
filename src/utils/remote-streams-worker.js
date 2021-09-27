import {
  fromReadablePort,
  fromWritablePort,
} from "remote-web-streams";
import { Duplex, Readable, Writable } from "stream";

export function createDuplexToClient(readablePort, writablePort) {
  const readable = fromReadablePort(readablePort);
  const writable = fromWritablePort(writablePort);

  const reader = readable.getReader();
  const writer = writable.getWriter();

  const duplex = new Duplex({
    async read(size) {
      const { value, done } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
    write(chunk, encoding, done) {
      writer.write(chunk);
      done();
    },
    async destroy(err, cb) {
      await Promise.all([writer.close(), reader.cancel()])
      cb(err)
    },
  });

  return duplex;
}

export function createReaderToClient(readablePort) {
  const readable = fromReadablePort(readablePort);
  const reader = readable.getReader();

  return new Readable({
    async read(size) {
      const { value, done } = await reader.read();
      if (done) {
        this.push(null);
      } else {
        this.push(value);
      }
    },
    async destroy(err, cb) {
      await reader.cancel();
      cb(err)
    }
  });
}

export function createWriterToClient(writablePort) {
  const writable = fromWritablePort(writablePort);
  const writer = writable.getWriter();

  return new Writable({
    write(chunk, encoding, done) {
      writer.write(chunk);
      done();
    },
    async destroy(err, cb) {
      await writer.close();
      cb(err);
    }
  });
}