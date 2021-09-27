import fs from "fs"
import { proxy } from "web-worker-proxy"
import { CHILD_PROCESS_FAILED, CHILD_PROCESS_SUCCEEDED, CREATE_CHILD_PROCESS } from "../client/create-worker-thread.js";

export default (messagePort) => async (command) => {
  const { port1: fsProxyPort, port2: transferPort } = new MessageChannel();

  proxy(fs, fsProxyPort);

  //TODO God willing: somehow connect a fresh duplex to term and term to worker, God willing,
  //  so when it closes, we might figure it out, God willing.
  messagePort.postMessage({
    action: CREATE_CHILD_PROCESS,
    payload: command,
    fsProxyPort: transferPort
  }, [transferPort]);

  await new Promise((resolve, reject) => {
    
    messagePort.onmessage = function(event) {
      const { action, payload } = event.data;
      if (action === CHILD_PROCESS_SUCCEEDED) {
        resolve(payload)
      }

      if (action === CHILD_PROCESS_FAILED) {
        reject(payload)
      }
    }
  });
}