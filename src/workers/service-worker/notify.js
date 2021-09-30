export function notifyAll(message) {
 
  self.clients.matchAll().then((all) =>
    all.map((client) => {
      if (typeof message === 'function') {
        message = message(all);
      }

      client.postMessage(message)
    })
  );
}