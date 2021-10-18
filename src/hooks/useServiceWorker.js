import { useEffect, useState } from "preact/hooks";
import { SW_ACTIVATED } from "../workers/service-worker/actions.js";

export default function (options = {}) {
  const [registrationSucceeded, setRegistrationSucceeded] = useState(false);
  const [registrationFailed, setRegistrationFailed] = useState(false);
  const [serviceWorker, setServiceWorker] = useState(null);

  useEffect(async () => {
    if ("serviceWorker" in navigator) {
      try {
        //const url = new URL("../service-worker.js", import.meta.url);
        const url = "./service-worker.js";
        let cancelSetCurrentServiceWorkerTimeout;

        navigator.serviceWorker.addEventListener(
          "message",
          function handler(event) {
            if (event.data.action === SW_ACTIVATED) {
              clearTimeout(cancelSetCurrentServiceWorkerTimeout);
              setServiceWorker(navigator.serviceWorker.controller);
            }
          }
        );

        const registration = await navigator.serviceWorker.register(url, {
          scope: "./",
        });

        console.log("Service Worker Registered");

        cancelSetCurrentServiceWorkerTimeout = setTimeout(() => {
          if (registration && registration.active) {
            setServiceWorker(registration.active);
          }
        }, options.timeout || 5000)

        setRegistrationSucceeded(true);
      } catch (err) {
        console.log("Service Worker Failed to Register", err);
        setRegistrationFailed(true);
      }
    }
  }, []);

  return [serviceWorker, registrationSucceeded, registrationFailed]
}
