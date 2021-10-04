import fs from "fs"
import { createWriterToClient, createReaderToClient } from "remote-worker-streams/worker";
import { proxy } from "@sahidmiller/web-worker-proxy";
import { CREATE_READ_STREAM, CREATE_WRITE_STREAM } from "../actions.js";

//Setup sync proxy
export { createSyncResponse } from "./sync.js"

export function createFsProxy(fsProxyPort) {
  proxy(fs, fsProxyPort, {
    intercept(event) {
      const { action, payload } = event.data || {};
    
      if (action === CREATE_WRITE_STREAM) {
        const { readablePort, path } = payload;
        const readable = createReaderToClient(readablePort);
        readable.pipe(fs.createWriteStream(path));
      }
    
      if (action === CREATE_READ_STREAM) {
        const { writablePort, path } = payload;
        const writable = createWriterToClient(writablePort);
        fs.createReadStream(path).pipe(writable);
      }
    }
  });
}