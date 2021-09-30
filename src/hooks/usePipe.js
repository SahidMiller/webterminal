import { useEffect } from "preact/compat";

export default function usePipe(sourceStdio, destinationStdio) {

  useEffect(() => {
    if (!sourceStdio || !destinationStdio) return;

    const writeSource = function(data) {
      sourceStdio.write(data)
    }

    const writeDestination = function(data) {
      destinationStdio.write(data)
    }

    sourceStdio.on("data", writeDestination);
    destinationStdio.on("data", writeSource);
    
    // sourceStdio.pipe(destinationStdio, { end: false });
    // destinationStdio.pipe(sourceStdio, { end: false });

    return () => {
      // sourceStdio.unpipe(destinationStdio);
      // destinationStdio.unpipe(sourceStdio);

      sourceStdio.removeListener("data", writeDestination)
      destinationStdio.removeListener("data", writeSource)
    };

  }, [sourceStdio, destinationStdio]);
}

export function useDisposePipe(disposable, onDispose) {
  useEffect(() => {
    if (!disposable) return
    
    remoteWorkerStdio.on("end", onDispose);
    return () => remoteWorkerStdio.removeListener("end", onDispose);

  }, [disposable])
}