const zlib = require("node-stackify/zlib");

const {
  DEFLATE = 1,
  INFLATE = 2,
  Z_DEFAULT_CHUNK,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_MEMLEVEL,
  Z_DEFAULT_STRATEGY,
  Z_DEFAULT_WINDOWBITS,
  Z_PARTIAL_FLUSH,
} = zlib;

zlib.constants = {
  DEFLATE,
  INFLATE,
  Z_DEFAULT_CHUNK,
  Z_DEFAULT_COMPRESSION,
  Z_DEFAULT_MEMLEVEL,
  Z_DEFAULT_STRATEGY,
  Z_DEFAULT_WINDOWBITS,
  Z_PARTIAL_FLUSH,
};

module.exports = zlib;