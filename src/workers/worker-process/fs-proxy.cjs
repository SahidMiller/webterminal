const {createFsClient} = require("../proxy-fs/client/index.js");

module.exports.bootstrap = function (proxyPort) {
  const fs = createFsClient(proxyPort);

  Object.assign(module.exports, {
    promises: {
      async access(path, mode) {
        return new Promise((res, rej) => {
          fs.access(path, mode, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async appendFile(path, data, options) {
        return new Promise((res, rej) => {
          fs.appendFile(path, data, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async chmod(path, mode) {
        return new Promise((res, rej) => {
          fs.chmod(path, mode, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async chown(path, uid, gid) {
        return new Promise((res, rej) => {
          fs.chown(path, uid, gid, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async copyFile(src, dest, mode) {
        return new Promise((res, rej) => {
          fs.copyFile(src, dest, mode, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async cp(src, dest, options) {
        return new Promise((res, rej) => {
          fs.cp(src, dest, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async lchmod(path, mode) {
        return new Promise((res, rej) => {
          fs.lchmod(path, mode, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async lchown(path, uid, gid) {
        return new Promise((res, rej) => {
          fs.lchown(path, uid, gid, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async lutimes(path, atime, mtime) {
        return new Promise((res, rej) => {
          fs.lutimes(path, atime, mtime, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async link(existingPath, newPath) {
        return new Promise((res, rej) => {
          fs.link(existingPath, newPath, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async lstat(path, options) {
        return new Promise((res, rej) => {
          fs.lstat(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async mkdir(path, options) {
        return new Promise((res, rej) => {
          fs.mkdir(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async mkdtemp(prefix, options) {
        return new Promise((res, rej) => {
          fs.mkdtemp(prefix, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async open(path, flags, mode) {
        return new Promise((res, rej) => {
          fs.open(path, flags, mode, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async opendir(path, options) {
        return new Promise((res, rej) => {
          fs.opendir(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async readdir(path, options) {
        return new Promise((res, rej) => {
          fs.readdir(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async readFile(path, options) {
        return new Promise((res, rej) => {
          fs.readFile(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async readlink(path, options) {
        return new Promise((res, rej) => {
          fs.readlink(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async realpath(path, options) {
        return new Promise((res, rej) => {
          fs.realpath(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async rename(oldPath, newPath) {
        return new Promise((res, rej) => {
          fs.rename(oldPath, newPath, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async rmdir(path, options) {
        return new Promise((res, rej) => {
          fs.rmdir(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async rm(path, options) {
        return new Promise((res, rej) => {
          fs.rm(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async stat(path, options) {
        return new Promise((res, rej) => {
          fs.stat(path, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async symlink(target, path, type) {
        return new Promise((res, rej) => {
          fs.symlink(target, path, type, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async truncate(path, len) {
        return new Promise((res, rej) => {
          fs.truncate(path, len, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async unlink(path) {
        return new Promise((res, rej) => {
          fs.unlink(path, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async utimes(path, atime, mtime) {
        return new Promise((res, rej) => {
          fs.utimes(path, atime, mtime, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async watch(filename, options) {
        return new Promise((res, rej) => {
          fs.watch(filename, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      },
      async writeFile(file, data, options) {
        return new Promise((res, rej) => {
          fs.writeFile(file, data, options, (err, data) => {
            err ? rej(err) : res(data)
          })
        })
      }
    },
    constants: fs.constants,
    access: fs.access,
    accessSync: fs.accessSync,
    appendFile: fs.appendFile,
    appendFileSync: fs.appendFileSync,
    chmod: fs.chmod,
    chmodSync: fs.chmodSync,
    chown: fs.chown,
    chownSync: fs.chownSync,
    close: fs.close,
    closeSync: fs.closeSync,
    createReadStream: fs.createReadStream,
    createWriteStream: fs.createWriteStream,
    exists: fs.exists,
    existsSync: fs.existsSync,
    fchmod: fs.fchmod,
    fchmodSync: fs.fchmodSync,
    fchown: fs.fchown,
    fchownSync: fs.fchownSync,
    fstat: fs.fstat,
    fstatSync: fs.fstatSync,
    fsync: fs.fsync,
    fsyncSync: fs.fsyncSync,
    futimes: fs.futimes,
    futimesSync: fs.futimesSync,
    lchmod: fs.lchmod,
    lchmodSync: fs.lchmodSync,
    lchown: fs.lchown,
    lchownSync: fs.lchownSync,
    link: fs.link,
    linkSync: fs.linkSync,
    lstat: fs.lstat,
    lstatSync: fs.lstatSync,
    mkdir: fs.mkdir,
    mkdirSync: fs.mkdirSync,
    open: fs.open,
    openSync: (...args) => {
      if (args[0] === "/dev/tty") {
        return 3;
      }

      return fs.openSync(...args)
    },
    read: fs.read,
    readdir: fs.readdir,
    readdirSync: fs.readdirSync,
    readFile: fs.readFile,
    readFileSync: fs.readFileSync,
    readlink: fs.readlink,
    readlinkSync: fs.readlinkSync,
    readSync: fs.readSync,
    realpath: fs.realpath,
    realpathSync: fs.realpathSync,
    rename: fs.rename,
    renameSync: fs.renameSync,
    rmdir: fs.rmdir,
    rmdirSync: fs.rmdirSync,
    stat: fs.stat,
    statSync: fs.statSync,
    symlink: fs.symlink,
    symlinkSync: fs.symlinkSync,
    truncate: fs.truncate,
    truncateSync: fs.truncateSync,
    unlink: fs.unlink,
    unlinkSync: fs.unlinkSync,
    unwatchFile: fs.unwatchFile,
    utimes: fs.utimes,
    utimesSync: fs.utimesSync,
    watch: fs.watch,
    watchFile: fs.watchFile,
    write: fs.write,
    writeFile: fs.writeFile,
    writeFileSync: fs.writeFileSync,
    writeSync: fs.writeSync,
    getCwd: fs.getCwd
  });

  return module.exports;
}