import "regenerator-runtime/runtime";

import { h, render } from "preact";
import { useState, useMemo, useEffect } from "preact/hooks";

import { MultiTerminal } from "tess";

import useBashWorkerReadline from "./hooks/useBashWorkerReadline.js";

function App(props) {
  const [isReady, pipe] = useBashWorkerReadline();

  const terminals = useMemo(() => {
    return [
      {
        program: (duplex, term) => {
          pipe(duplex);
        },
        welcomeMessage: `Welcome to xterm.js\nThis is a local terminal emulation, without a real terminal in the back-end.\nType some keys and commands to play around.\n\n`,
        colors: {
          terminal: {
            theme: {
              background: "#21252b",
            },
          },
        },
      },
    ];
  }, []);

  return (
    <MultiTerminal
      style={"width:100%; height:100%; position:absolute"}
      terminals={terminals}
    />
  );
}

try {
render(<App />, document.getElementById("app"));
} catch (err) {
  alert(err);
}