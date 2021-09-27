import {
  RemoteWritableStream,
  RemoteReadableStream,
} from "remote-web-streams";
import { Duplex, Readable, Writable } from "stream";

export function createDuplexToWorker(worker) {
  //Basically once service workers are reader, God willing, we setup our streams
  const { writable, readablePort } = new RemoteWritableStream();
  const { readable, writablePort } = new RemoteReadableStream();

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

  if (worker) {
    worker.postMessage({ readablePort, writablePort }, [
      readablePort,
      writablePort,
    ]);

    return duplex;
  }

  return [duplex, readablePort, writablePort];
}

export function createReaderToWorker() {
  //Basically once service workers are reader, God willing, we setup our streams
  const { readable, writablePort } = new RemoteReadableStream();
  const reader = readable.getReader();

  const readableStream = new Readable({
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
      cb(err);
    },
  });

  return [readableStream, writablePort]
}

export function createWriterToWorker() {
  //Basically once service workers are reader, God willing, we setup our streams
  const { writable, readablePort } = new RemoteWritableStream();
  const writer = writable.getWriter();

  const writableStream = new Writable({
    write(chunk, encoding, done) {
      writer.write(chunk);
      done();
    },
    async destroy(err, cb) {
      await writer.close();
      cb(err);
    },
  });

  return [writableStream, readablePort]
}