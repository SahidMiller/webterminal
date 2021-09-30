# Service Worker Architecture

Service worker can be used for a number of technical reasons:

- as a singleton for file system access (option fs sync for workers using synchronous xhr)
  -  (generic) proxy implementation can be provided to workers and method calls and property access handled by workers, synchronously or asynchronously.
  -  (non-generic) use transferables to handle streams, God willing.
    - this might be able to be done, generically with type checking.
  - fs file descriptors and process tracking across windows, God willing.
- as a singleton for readline and bash.
- as a singleton for command completion.

## Server Actions

- CREATE_READLINE_INTERFACE***
  - readablePort: reader for client to write keyboard to and service worker to read.
  - writablePort: writer for service worker to write output and client to read.
  - messagePort: port for filesystem proxy?

- CREATE_FS_PROXY***
  - messagePort: port for filesystem proxy

- GET_COMPLETIONS**
  - messagePort: port for sending line to service worker, send result back to client.

- CREATE_READ_STREAM***
  - writablePort: port for client to read from and serviceworker to write to.
  - path: path for service worker to read from for client.

- CREATE_WRITE_STREAM***
  - readablePort: port for client to write to and serviceworker to read from.
  - path: path for service worker to write to for client.

** Relies on fs.
*** Relies on fs proxy.

## Client

- CREATE_READLINE_INTERFACE
  - readablePort: reader for client to write keyboard to and service worker to read.
  - writablePort: writer for service worker to write output and client to read.
  - messagePort: port for filesystem proxy?

- CREATE_FS_PROXY**
  - messagePort: port for filesystem proxy

- GET_COMPLETIONS
  - messagePort: port for sending line to service worker, send result back to client.

- CREATE_READ_STREAM**
  - writablePort: port for client to read from and serviceworker to write to.
  - path: path for service worker to read from for client.

- CREATE_WRITE_STREAM**
  - readablePort: port for client to write to and serviceworker to read from.
  - path: path for service worker to write to for client.

** Used by fs proxy.