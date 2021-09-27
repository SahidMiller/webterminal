import { createDuplexToWorker, createReaderToWorker, createWriterToWorker } from "../../utils/remote-streams-client.js";

export const CREATE_CHILD_PROCESS = "CREATE_CHILD_PROCESS"
export const CHILD_PROCESS_SUCCEEDED = "CHILD_PROCESS_SUCCEEDED"
export const CHILD_PROCESS_FAILED = "CHILD_PROCESS_FAILED"

export default function createWorkerThread(command, { messe, fsProxyPort, dimensions }) {
  const worker = new Worker("./node-worker.js");

  const [
    duplexToChildProcess,
    readablePortToWorker,
    writablePortToWorker,
  ] = createDuplexToWorker();

  duplexToChildProcess.on("end", () => worker.terminate());

  worker.postMessage(
    {
      readablePort: readablePortToWorker,
      writablePort: writablePortToWorker,
      fsProxyPort,
      command,
      dimensions
    },
    [readablePortToWorker, writablePortToWorker, fsProxyPort]
  );

  return [duplexToChildProcess, worker]
}

export function createWorkerThreadProcess(command, { messe, fsProxyPort, dimensions }) {
  const worker = new Worker("./node-worker.js");

  const [processStdout, writablePortToWorker] = createReaderToWorker();
  const [processStdin, readablePortToWorker] = createWriterToWorker();

  processStdout.on("end", () => worker.terminate());

  worker.postMessage(
    {
      readablePort: readablePortToWorker,
      writablePort: writablePortToWorker,
      fsProxyPort,
      command,
      dimensions,
      stdinIsTTY: true,
      stdoutIsTTY: true,
    },
    [readablePortToWorker, writablePortToWorker, fsProxyPort]
  );

  return [processStdin, processStdout, worker]
}