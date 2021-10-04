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

        navigator.serviceWorker.addEventListener(
          "message",
          function handler(event) {
            if (event.data.action === SW_ACTIVATED) {
              setServiceWorker(navigator.serviceWorker.controller);
            }
          }
        );

        const registration = await navigator.serviceWorker.register(url, {
          scope: "./",
        });

        console.log("Service Worker Registered");

        if (registration && registration.active) {
          setServiceWorker(registration.active);
        }

        setRegistrationSucceeded(true);
      } catch (err) {
        console.log("Service Worker Failed to Register", err);
        setRegistrationFailed(true);
      }
    }
  }, []);

  return [serviceWorker, registrationSucceeded, registrationFailed]
}
