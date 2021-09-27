import createReadline from "../../utils/create-readline"
import useServiceWorker from "./useServiceWorker.js";
import { useEffect, useState, useRef } from "preact/compat";
import uid from "../../utils/uid"
import createWorkerThread from "./create-worker-thread";
import usePipe from "../../utils/usePipe";

export default function() {

  //TODO God willing: wait for service worker then open a stream, God willing.
  //can buffer readline and pause if they hit enter up to that point, God willing.
  // don't even think we need a prompt since it's not setup yet

  const [isReady, setIsReady] = useState(false);
  const [serviceWorker] = useServiceWorker();

  const [termStdio, setStdio] = useState(null);
  const [bashProcess, setBashProcess] = useState(null);

  const completionsRef = useRef(null);
  const executeCommand = useRef(null);

  useEffect(() => {
    if (!serviceWorker) {
      completionsRef.current = (line) => [[], line];
      return
    }

    const { port1: messagePort, port2: transferPort } = new MessageChannel();
    serviceWorker.postMessage({ 
      action: "GET_COMPLETIONS", 
      payload: transferPort
    }, [transferPort]);
    
    const callbacks = {};

    messagePort.onmessage = function(event) {
      callbacks[event.data.id](null, event.data.result);
    }

    const getCompletions = (line, callback) => {
      const id = new uid();
      messagePort.postMessage({ id, line });
      callbacks[id] = callback;
    }

    completionsRef.current = getCompletions;

  }, [serviceWorker]);

  useEffect(() => {
    if (!termStdio || !serviceWorker) return;

    const { port1: fsProxyPort, port2: transferFsProxyPort } = new MessageChannel();

    serviceWorker.postMessage({ action: "CREATE_FS_PROXY", payload: fsProxyPort }, [fsProxyPort])

    //No good way to know it's finished
    const [bashProcess, worker] = createWorkerThread("bash --persistent", {
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

    setBashProcess(bashProcess);

    executeCommand.current = (command) => bashProcess.write(command);
  }, [termStdio, serviceWorker])

  useEffect(() => {
    if (!termStdio) return;

    createReadline(termStdio, async (line) => {
      //basically run the child_process ourselves, God willing;
      executeCommand.current(line);
    }, 
    { 
      completer: (line, callback) => {
        completionsRef.current(line, callback)
      }
    })

  }, [termStdio, completionsRef]);

  useEffect(() => {
    if (!termStdio || !bashProcess) return;

    bashProcess.pipe(termStdio, { end: false });
    return () => {
      bashProcess.unpipe(termStdio);
    }
  }, [termStdio, bashProcess])

  return [isReady, setStdio];
}