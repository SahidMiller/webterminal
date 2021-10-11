const fs = require("fs");
const path = require("path");
const { default: setupXterm } = require("./setupXterm");

async function fetchAndSave(url, path, mode) {
  await fetch(url).then(saveTo(path, mode));
}

function saveTo(pathToSave, mode) {
  return async (source) => {
    const dir = path.dirname(pathToSave);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(pathToSave, await source.text(), { mode });
  }
}

// function sucklessRequire(context) {
//   const filenames = context.keys();
//   return Promise.all(filenames.map(filename => {
//     const url = context(filename);
//     const destination = filename.startsWith("./") ? 
//       path.join(filepath, filename) : 
//       path.join(filepath, "node_modules", filename);

//     return fetchAndSave(url, destination, 755);
//   }))
// }

// sucklessRequire(require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/vim/dist', false, /\.*\.(js|ini)$/));
// sucklessRequire(require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/bash/dist', true, /\.*\.js$/));
// sucklessRequire(require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/ssh/dist', true, /\.*\.js$/));
// sucklessRequire(require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/webpack/dist', true, /\.*\.js$/));
// sucklessRequire(require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/yarn/dist', true, /\.*\.js$/));
// sucklessRequire(require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/minimal-ipfs/dist', true, /\.*\.js$/));

const bashContext = require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/bash/dist', true, /\.*\.js$/);
const minimalIpfsContext = require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/minimal-ipfs/dist', true, /\.*\.js$/);
const ipfsContext = require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/ipfs/dist', true, /\.*\.js$/);
// const vimContext = require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/vim/dist', false, /\.*\.(js|ini)$/);
// const sshContext = require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/ssh/dist', true, /\.*\.js$/);
// const webpackContext = require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/webpack/dist', true, /\.*\.js$/);
// const yarnContext = require.context('!file-loader?esModule=false&outputPath=service-worker!@webterm-tools/yarn/dist', true, /\.*\.js$/);

//Most of these probably should be downloaded and/or built themselves, God willing.
//Perhaps providing webpack configs for us to easily build, God willing.
const files = {
  bash: {
    sucklessContext: bashContext,
    path: "/bin/bash",
    mode: 755
  },
  // yarn: {
  //   sucklessContext: yarnContext,
  //   path: "/usr/bin/yarn",
  //   mode: 755
  // },
  // webpack: {
  //   sucklessContext: webpackContext,
  //   path: "/usr/bin/webpack",
  //   mode: 755
  // },
  // vimjs: {
  //   sucklessContext: vimContext,
  //   path: "/bin/vim",
  //   mode: 755
  // },
  // ssh: {
  //   sucklessContext: sshContext,
  //   path: "/bin/ssh",
  //   mode: 755
  // },
  "minimal-ipfs": {
    sucklessContext: minimalIpfsContext,
    path: "/etc/node_modules/minimal-ipfs",
    mode: 755
  },
  ipfs: {
    sucklessContext: ipfsContext,
    path: "/bin/ipfs",
    mode: 755
  },

  //Vimjs
  // "vimjs": {
  //   context: vimContext,
  //   modulePath: "./index.js",
  //   path: "/bin/vim/index.js",
  //   mode: 755
  // },
  // "editor-widget-config": {
  //   context: vimContext,
  //   modulePath: "./default-config.ini",
  //   path: "/default-config.ini",
  //   mode: 755
  // },
  // "slap-widget-config": {
  //   context: vimContext,
  //   modulePath: "./slap.ini",
  //   path: "/slap.ini",
  //   mode: 755
  // },
  // "base-widget-config": {
  //   context: vimContext,
  //   modulePath: "./base-widget.ini",
  //   path: "/base-widget.ini",
  //   mode: 755
  // },

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
  directories.forEach((directory) => typeof directory === 'string' && fs.mkdirSync(directory, { recursive: true }));

  await Promise.all(Object.values(files).map(async (file) => {
    const { sucklessContext, context, modulePath, path: filepath, mode, url, value }= file;
    if (url) {
      return fetchAndSave(url, filepath, mode);
    }
    
    if (value) {
      return fs.writeFileSync(filepath, value, mode);
    }
    
    if (context && modulePath) {
      
      const url = context(modulePath);
      return fetchAndSave(url, filepath, mode);
    }

    if (sucklessContext) {
      const filenames = sucklessContext.keys();
      return Promise.all(filenames.map(filename => {
        const url = sucklessContext(filename);
        const destination = filename.startsWith("./") ? 
          path.join(filepath, filename) : 
          path.join(filepath, "node_modules", filename);

        return fetchAndSave(url, destination, mode);
      }))
    }
  }));

  setupXterm();
}
