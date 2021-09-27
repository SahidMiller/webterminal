//memfs here
import fs from "fs";

import bashUtilsSourceUrl from "!file-loader!browser-devtools/bash-utils";
import bashCliSourceUrl from "!file-loader!browser-devtools/bash";

//Immediately load VirtualFS
const bootstrap = import("fs").then(async () => {
  globalThis.fs = fs;
  
  fs.mkdirSync("/bin");
  fs.mkdirSync("/lib");
  fs.mkdirSync("/usr/bin", { recursive: true });
  fs.mkdirSync("/etc");

  await Promise.all([
    fetch(bashUtilsSourceUrl).then(async (bashUtilsSource) => {
      fs.writeFileSync("/bin/bash-utils.js", await bashUtilsSource.text(), {
        mode: 755,
      });
    }),
    fetch(bashCliSourceUrl).then(async (bashCliSource) => {
      fs.writeFileSync("/bin/bash", await bashCliSource.text(), {
        mode: 755,
      });
    })
  ])
  
  //Delay loading main until fs is preloaded with data
  const { default:execute } = await import("./index.js")
  return execute
});

//Immediately add event listener
self.addEventListener("message", async (event) => {
  const { command, readablePort, writablePort } = event.data;
  
  //Delay setting up worker until fs is setup globally
  const { default:execute } = await bootstrap
  globalFs.setFs(globalThis.fs);

  //Delay streams until fs is setup due to process
  const { createDuplexToClient } = await import("../utils/remote-streams.js");
  const duplex = createDuplexToClient(readablePort, writablePort);

  execute(command, duplex)
})