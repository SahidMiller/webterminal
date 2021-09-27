import "regenerator-runtime/runtime";

// import Tessreact from "tessreact";
// import reducer from "tessreact/reducer";

// import { Provider } from "react-redux";
// import { createStore } from "redux";
// const store = createStore(reducer);

import { h, render } from "preact";
import { useState, useMemo, useEffect } from "preact/hooks";

import { MultiTerminal } from "tess";

import useServiceWorkerReadline from "./sw/client/useServiceWorkerReadline.js";
import useBashWorkerReadline from "./sw/client/useBashWorkerReadline.js";
import useServiceWorkerCompletions from "./sw/client/useServiceWorkerCompletions.js";

function App(props) {
  //const [isReady, pipe] = useServiceWorkerReadline();
  //const [isReady, pipe] = useServiceWorkerCompletions();
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