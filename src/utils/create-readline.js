import { createInterface } from "readline";

const completerFn = (line = "") => {
  return [];
};

const onLineFn = (line = "") => {};
export default function useReadline(
  duplex,
  onLine = onLineFn,
  {
    completer = completerFn,
    terminal = true,
    history = [],
    prompt = "$ ",
    crlfDelay = Infinity,
    escapeCodeTimeout = 500,
    tabSize = 8,
    signal = undefined,
  }
) {
  const consoleInterface = createInterface({
    //Readable (so push to it)
    input: duplex,
    //Writeable by the other side, God willing.
    output: duplex,
    completer,
    terminal,
    history,
    prompt,
    crlfDelay,
    escapeCodeTimeout,
    tabSize,
    signal,
  });

  consoleInterface.prompt();

  consoleInterface.on("line", async (input) => {
    try {
      onLine && (await onLine(input.trim(), consoleInterface));
    } catch (err) {
      if (err && err.stack) {
        consoleInterface.write(err.stack.toString() + "\n");
      } else if (err) {
        consoleInterface.write(err.toString() + "\n");
      }

      console.log(err);
    }

    consoleInterface.prompt();
  });

  //TODO God willing: close handlers
  return consoleInterface;
}
