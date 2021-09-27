import createReadline from "../../utils/create-readline"
import useServiceWorker from "./useServiceWorker.js";
import { useEffect, useState, useRef } from "preact/compat";
import uid from "../../utils/uid"
import { createWorkerThreadProcess } from "./create-worker-thread";
import usePipe from "../../utils/usePipe";

export default function() {

  //TODO God willing: wait for service worker then open a stream, God willing.
  //can buffer readline and pause if they hit enter up to that point, God willing.
  // don't even think we need a prompt since it's not setup yet

  const [isReady, setIsReady] = useState(false);
  const [serviceWorker] = useServiceWorker();

  const [termStdio, setStdio] = useState(null);
  const [bashProcess, setBashProcess] = useState(null);

  useEffect(() => {
    if (!termStdio || !serviceWorker) return;

    const { port1: fsProxyPort, port2: transferFsProxyPort } = new MessageChannel();

    serviceWorker.postMessage({ action: "CREATE_FS_PROXY", payload: fsProxyPort }, [fsProxyPort])
    
    //No good way to know it's finished
    const [bashStdin, bashStdout, worker] = createWorkerThreadProcess("bash --persistent", {
      fsProxyPort: transferFsProxyPort,
      dimensions: { columns: termStdio.columns, rows: termStdio.rows }
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

    const writeSource = function(data) {
      termStdio.write(data)
    }

    const writeDestination = function(data) {
      bashStdin.write(data)
    }

    termStdio.on("data", writeDestination);
    bashStdout.on("data", writeSource);
    
    return () => {

      termStdio.removeListener("data", writeDestination)
      bashStdout.removeListener("data", writeSource)
      bashStdout.destroy();
    };

  }, [termStdio, serviceWorker])

  return [isReady, setStdio];
}