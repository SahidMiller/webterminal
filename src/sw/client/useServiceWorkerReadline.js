import useServiceWorker from "./useServiceWorker.js";
import { useEffect, useState } from "preact/compat";
import { createDuplexToWorker } from "../../utils/remote-streams-client.js";
import createWorkerThread, { CREATE_CHILD_PROCESS, CHILD_PROCESS_SUCCEEDED } from "./create-worker-thread.js";
import usePipe, { useDisposePipe } from "../../utils/usePipe.js";

export default function () {
  //TODO God willing: wait for service worker then open a stream, God willing.
  //can buffer readline and pause if they hit enter up to that point, God willing.
  // don't even think we need a prompt since it's not setup yet

  const [isReady, setIsReady] = useState(false);
  const [serviceWorker, isServiceWorkerReady, hasServiceWorkerFailed] = useServiceWorker();

  const [termStdio, setStdio] = useState(null);
  const [remoteStdio, setRemoteStdio] = useState(null);
  const [remoteWorkerStdio, setRemoteWorkerStdio] = useState(null);
  const [serviceWorkerMessagePort, setServiceWorkerMessagePort] = useState(null);

  useEffect(() => {
    if (hasServiceWorkerFailed) {
      //TODO God willing: import local version, God willing. Can use workers but cannot use synchronous fs api. So might as well run in same context, God willing.
      //Want to import files, setup builtins, and also pipe readline to these filesystem executables, God willing.
    }
  }, [hasServiceWorkerFailed])


  useEffect(async () => {
    if (!serviceWorker) return;

    const [duplexToServiceWorker, readablePort, writablePort] =
      createDuplexToWorker();
    const { port1: messagePort, port2: transferPort } = new MessageChannel();

    serviceWorker.postMessage(
      { 
        action: "CREATE_READLINE_INTERFACE",
        payload: { readablePort, writablePort, messagePort: transferPort },
      },
      [readablePort, writablePort, transferPort]
    );

    setServiceWorkerMessagePort(messagePort);
    setRemoteStdio(duplexToServiceWorker);
  }, [serviceWorker]);

  useEffect(() => {

    if (serviceWorkerMessagePort && termStdio) {

      serviceWorkerMessagePort.onmessage = function (event) {
        const { action, payload } = event.data;
        if (action === CREATE_CHILD_PROCESS) {
          const [workerStdio, worker] = createWorkerThread(payload, {
            fsProxyPort: event.data.fsProxyPort,
            dimensions: {
              columns: termStdio.columns,
              rows: termStdio.rows
            }
          });
          
          //TODO God willing: setup a way for worker to create new streams, God willing. 
          // streams to the service worker if possible, God willing.
          worker.onmessage = function(e) {
            if (e.data && e.data.action === "CREATE_WRITE_STREAM") {
              serviceWorker.postMessage(e.data, [e.data.payload.readablePort])
            } else if (e.data && e.data.action === "CREATE_READ_STREAM") {
              serviceWorker.postMessage(e.data, [e.data.payload.writablePort])
            } else if (e.data && e.data.action === "CREATE_FS_PROXY") {
              serviceWorker.postMessage(e.data, [e.data.payload]);
            }
          }

          workerStdio.on("end", () => {
            //Allow time for other events to run (like piping back to terminal)
            setTimeout(() => {
              serviceWorkerMessagePort.postMessage({ action: CHILD_PROCESS_SUCCEEDED })
            });
          });

          setRemoteWorkerStdio(workerStdio)
        }
      };
    }
  }, [serviceWorkerMessagePort, termStdio])

  usePipe(
    termStdio, 
    remoteWorkerStdio || remoteStdio
  );

  useDisposePipe(
    remoteWorkerStdio, 
    () => setRemoteWorkerStdio(null)
  )

  return [isReady, setStdio];
}
