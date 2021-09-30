import useServiceWorker from "./useServiceWorker.js";
import { useEffect, useState, useRef } from "preact/compat";
import { spawn } from "child_process";
import { createReaderToClient, createWriterToClient } from "remote-worker-streams/worker";

export default function() {

  //TODO God willing: wait for service worker then open a stream, God willing.
  //can buffer readline and pause if they hit enter up to that point, God willing.
  // don't even think we need a prompt since it's not setup yet

  const [isReady, setIsReady] = useState(false);
  const [serviceWorker] = useServiceWorker();

  const [termStdio, setStdio] = useState(null);
  const [childProcess, setChildProcess] = useState(false);

  useEffect(() => {
    if (childProcess || !termStdio || !serviceWorker) return;

    const { port1: fsProxyPort, port2: transferFsProxyPort } = new MessageChannel();
    serviceWorker.postMessage({ action: "CREATE_FS_PROXY", payload: fsProxyPort }, [fsProxyPort]);
    
    //Perhaps fake process before hand with columns and rows, God willing, if it uses globals.
    const childProcess = spawn("bash", ["-worker", "./worker.js"], {
      workerUrl: "./worker.js",
      shell: "/bin/sh",
      fsProxyPort: transferFsProxyPort,
      dimensions: { columns: termStdio.columns, rows: termStdio.rows },
      onMessage: (e = {}) => {

        const { action, payload } = e.data || {};

        if (e.data && e.data.action === "CREATE_TTY_WRITE_STREAM") {
    
          const { readablePort } = e.data.payload;
          const readable = createReaderToClient(readablePort);
          readable.pipe(termStdio);
    
        } else if (e.data && e.data.action === "CREATE_TTY_READ_STREAM") {
    
          const { writablePort } = e.data.payload;
          const writable = createWriterToClient(writablePort);
          termStdio.pipe(writable);

        } else if (action === "CREATE_FS_PROXY") {
          serviceWorker.postMessage({ action: "CREATE_FS_PROXY", payload: payload }, [payload]);
        }
      }
    });

    childProcess.stdout.on('end', () => {   
      termStdio.removeListener("data", writeDestination)
      childProcess.stdout.removeListener("data", writeSource) 
      setChildProcess(null)
    });

    const writeSource = function(data) {
      termStdio.write(data)
    }

    const writeDestination = function(data) {
      childProcess.stdin.write(data)
    }

    termStdio.on("data", writeDestination);
    childProcess.stdout.on("data", writeSource);
    
    setChildProcess(childProcess);

    return () => {
      childProcess.stdout.destroy();
    }
    
  }, [termStdio, serviceWorker]);
  
  return [isReady, setStdio];
}