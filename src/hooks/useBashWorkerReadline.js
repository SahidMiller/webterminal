import useServiceWorker from "./useServiceWorker.js";
import { useEffect, useState, useRef } from "preact/compat";
import { spawn } from "child_process";
import { createReaderToClient, createWriterToClient } from "remote-worker-streams/worker";
import { PassThrough } from "stream"
import useServiceWorkerIsReady from "./useServiceWorkerIsReady.js";

const kEscape = "\x1b";
function CSI(strings, ...args) {
  let ret = `${kEscape}[`;
  for (let n = 0; n < strings.length; n++) {
    ret += strings[n];
    if (n < args.length) ret += args[n];
  }
  return ret;
}

CSI.kEscape = kEscape;
CSI.kClearToLineBeginning = CSI`1K`;
CSI.kClearToLineEnd = CSI`0K`;
CSI.kClearLine = CSI`2K`;
CSI.kClearScreenDown = CSI`0J`;

export default function() {

  //TODO God willing: wait for service worker then open a stream, God willing.
  //can buffer readline and pause if they hit enter up to that point, God willing.
  // don't even think we need a prompt since it's not setup yet

  //TODO God willing: we can use readline ourselves too for more control
  const [isReady, setIsReady] = useState(false);
  const [serviceWorker] = useServiceWorker();
  const [isServiceWorkerReady, hasServiceWorkerFailed] = useServiceWorkerIsReady(serviceWorker, { timeout: 10000 });

  const [termStdio, setStdio] = useState(null);
  const [bashProcess, setBashProcess] = useState(false);

  const [didDisplayLoading, setDidDisplayLoading] = useState(false);

  useEffect(() => {
    if (termStdio && !didDisplayLoading) {
      termStdio.write("Loading... 😔  please be patient for it!");
      setDidDisplayLoading(true);
    }
  }, [termStdio, didDisplayLoading]);

  const [didDisplayRefresh, setDidDisplayRefresh] = useState(false);

  useEffect(() => {
    
    if (hasServiceWorkerFailed && termStdio && !didDisplayRefresh) {
      //Move cursor to beginning of line
      termStdio.write(CSI`${1}G`);
      termStdio.write(CSI.kClearToLineBeginning);
      //Assumes bash readline will clear
      termStdio.write("Failed to communicate with Service Worker. Please refresh.")
      setDidDisplayRefresh(true);
    }

  }, [hasServiceWorkerFailed, termStdio]);

  //Use should attach since we won't create until termstdio and serviceworker are in place, God willing.
  useEffect(() => {
    if (!termStdio || !serviceWorker || !!bashProcess || !isServiceWorkerReady) return;

    const { port1: fsProxyPort, port2: transferFsProxyPort } = new MessageChannel();
    serviceWorker.postMessage({ action: "CREATE_FS_PROXY", payload: fsProxyPort }, [fsProxyPort]);
    
    //Perhaps fake process before hand with columns and rows, God willing, if it uses globals.
    const childProcess = spawn("bash", ["-worker", "./worker.js"], {
      workerUrl: "./worker.js",
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
    
    setBashProcess(childProcess);
  }, [termStdio, serviceWorker, bashProcess, isServiceWorkerReady]);
  
  useEffect(() => {
    if (!bashProcess || !termStdio) return;

    bashProcess.stdout.on('end', () => {   
      termStdio.removeListener("data", writeDestination)
      bashProcess.stdout.removeListener("data", writeSource) 
      setBashProcess(null);
    });

    const writeSource = function(data) {
      termStdio.write(data)
    }

    const writeDestination = function(data) {
      bashProcess.stdin.write(data)
    }

    termStdio.on("data", writeDestination);
    bashProcess.stdout.on("data", writeSource);
  
  }, [bashProcess, termStdio]);

  return [isReady, setStdio];
}