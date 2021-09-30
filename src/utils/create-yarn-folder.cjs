const fs = require('fs');

async function downloadYarnModules() {
  //const yarnModulesContext = require.context('!file-loader?esModule=false!../../../../forks/yarn/node_modules/', true, /\.\/.*\.(js|json)$/);
}

async function downloadYarn() {
  const yarnContext = require.context('!file-loader?esModule=false!../../../../forks/yarn/src/', true, /\.\/.*\.js$/);
  
  fs.mkdirSync('/usr/lib/yarn');

  await Promise.all(yarnContext.keys().map(key => {
    const url = yarnContext(key);
    const filepath = path.resolve('/usr/lib/yarn/', key);
    const dirpath = path.dirname(filepath);
    
    if (!fs.existsSync(dirpath)) {
      fs.mkdirSync(dirpath);
    }
    
    return fetchAndSave(url, filepath, 777);
  }));
}

module.exports = downloadYarn;