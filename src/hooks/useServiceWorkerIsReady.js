import { useState, useEffect } from "preact/hooks";
import { SW_PING, SW_PONG } from "../workers/service-worker/actions.js";

export default function useServiceWorkerIsReady(serviceWorker, options = {}) {
  const [isReady, setIsReady] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [didTimeout, setDidTimeout] = useState(false);

  useEffect(() => {
    navigator.serviceWorker.addEventListener(
      "message",
      function handler(event) {
        if (event.data.action === SW_PONG) {
          setIsReady(true);
        }
      }
    );
  }, [])

  useEffect(() => {

    //Set timeout when serviceWorker is ready to ping
    if (serviceWorker && !isReady) {
      serviceWorker.postMessage({ action: SW_PING });
      const timeout = setTimeout(() => setDidTimeout(true), options.timeout || 1000);

      //remove timeout if serviceWorker or isReady changes value (stop setting as failed)
      // God willing, a late ping can setIsReady to true.
      return () => {
        clearTimeout(timeout);
      }
    }
  }, [isReady, serviceWorker]);

  useEffect(() => {
    if (didTimeout && !isReady) setHasFailed(true)
  }, [didTimeout, isReady]);
  
  return [isReady, hasFailed]
}