/**
 * Bootstrap a fs object for export using dynamic loading (used in workers when loading build-time modules after setting up fs and other dependent modules)
 * TODO God willing: expose instead as an external for any bundling and set it up in same way but as a global, God willing.
 * 
 * @param {Object} fs Filesystem to bootstrap for any require statements
 */
function bootstrap(fs) { 
  module.exports = fs; 
}

module.exports = { bootstrap }