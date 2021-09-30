const fs = require("fs");
const path = require("path");
const { default: setupXterm } = require("./setupXterm");

async function fetchAndSave(url, path, mode) {
  await fetch(url).then(saveTo(path, mode));
}

function saveTo(path, mode) {
  return async (source) => {
    fs.writeFileSync(path, await source.text(), { mode })
  }
}

const devtoolsContext = require.context('!file-loader?esModule=false&outputPath=service-worker!browser-devtools', false, /\.*\.js$/);

//Most of these probably should be downloaded and/or built themselves, God willing.
//Perhaps providing webpack configs for us to easily build, God willing.
const files = {
  ssh: {
    context: devtoolsContext,
    modulePath: "./ssh.js",
    path: "/bin/ssh",
    mode: 755
  },
  webpack: {
    context: devtoolsContext,
    modulePath: "./webpack.js",
    path: "/usr/bin/webpack",
    mode: 755
  },
  yarn: {
    context: devtoolsContext,
    modulePath: "./yarn.js",
    path: "/usr/bin/yarn",
    mode: 755
  },
  "bash-utils": {
    context: devtoolsContext,
    modulePath: "./bash-utils.js",
    path: "/bin/bash-utils.js",
    mode: 755
  },
  "bash-interpreter": {
    context: devtoolsContext,
    modulePath: "./bash-interpreter.js",
    path: "/bin/bash-interpreter",
    mode: 755
  },
  "bash": {
    context: devtoolsContext,
    modulePath: "./bash.js",
    path: "/bin/bash",
    mode: 755
  },
  "vimjs": {
    context: devtoolsContext,
    modulePath: "./vim.js",
    path: "/bin/vim",
    mode: 755
  },

  //Vimjs
  "editor-widget-config": {
    url: require("!file-loader?esModule=false&outputPath=service-worker!vimjs/editor-widget.ini"),
    path: "/default-config.ini",
    mode: 755
  },
  "slap-widget-config": {
    url: require("!file-loader?esModule=false&outputPath=service-worker!vimjs/slap.ini"),
    path: "/slap.ini",
    mode: 755
  },
  "base-widget-config": {
    url: require("!file-loader?esModule=false&outputPath=service-worker!vimjs/base-widget.ini"),
    path: "/base-widget.ini",
    mode: 755
  },

  //Yarn
  "package.json": {
    path: "/package.json",
    value: JSON.stringify({
      name: "sahidmiller.com",
    }, null, 2)
  },

  //Bash
  ".cashrc": {
    path: "/.cashrc",
    value: ""
  },
  
  //Routing
  "libp2p-config": {
    url: require("!file-loader?esModule=false&outputPath=service-worker!../../example.libp2p.config.js"),
    path: "/etc/libp2p-hosts.conf.js",
    mode: undefined
  },

  // ipfs: {
  //   path: "/usr/bin/ipfs",
  //   url: require("!file-loader?esModule=false!browser-devtools/ipfs-cli"),
  //   mode: 755
  // },
  
}

const directories = [
  "/bin", 
  "/lib", 
  "/usr/bin", 
  "/etc", 
  "/.config/yarn/link", 
  "/.cache/yarn"
]

module.exports.bootstrap = async function bootstrap() {
  directories.forEach((directory) => typeof directory === 'string' && fs.mkdirSync(directory));

  await Promise.all(Object.values(files).map(async (file) => {
    const { context, modulePath, path, mode, url, value }= file;
    if (url) {
      return fetchAndSave(url, path, mode);
    }
    
    if (value) {
      return fs.writeFileSync(path, value, mode);
    }
    
    if (context && modulePath) {
      const url = devtoolsContext(modulePath);
      return fetchAndSave(url, path, mode);
    }
  }));

  setupXterm();
}
