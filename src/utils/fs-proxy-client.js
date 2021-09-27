import { create, intercept } from "web-worker-proxy"
import xhr from "xhr"

export const FS_REQUEST_SUCCEEDED = "FS_REQUEST_SUCCEEDED"
export const FS_REQUEST_FAILED = "FS_REQUEST_FAILED"

function syncFsRequest(data) {
  let error, response;

  xhr({
    method: "post",
    body: JSON.stringify(data),
    uri: "/fs",
    headers: {
      "Content-Type": "application/json"
    },
    sync: true
  }, (err, resp, body) => {
    
    try {
      const { action, payload } = JSON.parse(body);
      if (action === FS_REQUEST_SUCCEEDED) {
        response = payload;
        return response
      } else if (action === FS_REQUEST_FAILED) {
        error = payload;
        return error
      }
    } catch (err) {
      error = "fs-proxy-client failed to get a valid response"
    }
  })

  if(error) {
    throw error
  }
  
  return response
}

import { createWriterToWorker, createReaderToWorker } from "./remote-streams-client";
export function fsClient(messagePort, ipcPort) {

  return create(messagePort, {
    send(actions, intercept) {
      //TODO God willing: somehow delegate or some calls to be implemented however, God willing.
      const previous = actions.slice(0, actions.length - 1);
      const last = actions[actions.length - 1] || {};
      const regex = /(Sync$)|(getCwd|chdir|constants)/
      
      if (actions.find((method) => regex.test(method.key))) {
        
        const response = syncFsRequest(actions)

        if (response && /^.?statSync$/.test(last.key)) {
          response.atime = response.atime && new Date(response.atime);
          response.birthtime = response.birthtime && new Date(response.birthtime);
          response.ctime = response.ctime && new Date(response.ctime);
          response.mtime = response.mtime && new Date(response.mtime);
        }

        return typeof response === 'undefined' ? null : response
      }

      if (actions.find((method) => method.key === "createWriteStream")) {

        if (last.key === "createWriteStream") {
          const [writableToClient, readablePort] = createWriterToWorker();

          ipcPort.postMessage({
            action: "CREATE_WRITE_STREAM",
            payload: {
              readablePort,
              path: last.args[0]
            }
          }, [readablePort]);
          
          writableToClient.on('finish', () => {
            writableToClient.destroy(null, () => {
              writableToClient.emit("close");
            });
          })

          return writableToClient
        }
      }

      if (actions.find((method) => method.key === "createReadStream")) {

        if (last.key === "createReadStream") {
          const [readableToClient, writablePort] = createReaderToWorker();

          ipcPort.postMessage({
            action: "CREATE_READ_STREAM",
            payload: {
              writablePort,
              path: last.args[0]
            }
          }, [writablePort]);
          
          readableToClient.on('finish', () => {
            readableToClient.destroy(null, () => {
              readableToClient.emit("close");
            });
          })

          return readableToClient
        }
      }
      
      if (last.key === "futimes") {
        const [fd, atime, mtime, cb] = last.args;

        let err, response;
        
        try {
          response = syncFsRequest([...previous, { type: "apply", key: "futimesSync", args: [fd, atime, mtime] }]);
        } catch (e) {
          err = e
        }

        //Really want to pass it the intercepter
        process.nextTick(() => cb(err, intercept([...previous, { type: 'apply', key: "futimesSync", args: [fd, atime, mtime] }], response)));
        return null;
      }

      if (/^.?stat$/.test(last.key)) {
        const [path, cb] = last.args;

        let err, response;
        
        try {
          response = syncFsRequest([...previous, { type: "apply", key: "statSync", args: [path] }]);
        } catch (e) {
          err = e
        }

        if (response) {
          response.atime = new Date(response.atime);
          response.birthtime = new Date(response.birthtime);
          response.ctime = new Date(response.ctime);
          response.mtime = new Date(response.mtime);
        }
        
        //Really want to pass it the intercepter
        process.nextTick(() => cb(err, intercept([...previous, { type: 'apply', key: last.key === "stat" ? "statSync" : "lstatSync", args: [path] }], response)));
        return null;
      }
    }
  });
}