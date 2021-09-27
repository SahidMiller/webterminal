import path from "path";
import getBinExecutables from "./executables.js";

function getBinExeCompletions(line) {
  const completion = getBinExecutables()
    .map((exe) => exe.split(path.sep).pop())
    .filter((exe) => exe.startsWith(line));

  return completion;
}

export default function completeExecutables(line) {
  const completions = getBinExeCompletions(line);
  return [completions, line];
}