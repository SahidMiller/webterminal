const crypto = require("node-stackify/crypto");
const md4 = require("js-md4");

const newCrypto = Object.assign({}, crypto);

const createVerify = crypto.createVerify;
newCrypto.createVerify = ((algo) => {
  algo = algo === "sha1" ? "RSA-SHA1" : algo;
  return createVerify(algo);
}).bind(newCrypto);

const createSign = crypto.createSign;
newCrypto.createSign = ((algo) => {
  algo = algo === "sha1" ? "RSA-SHA1" : algo;
  return createSign(algo);
}).bind(newCrypto);

const createHash = crypto.createHash;
newCrypto.createHash = ((algo) => {
  if (algo === "md4") {
    const md4Hasher = md4.create();
    const origDigest = md4Hasher.digest.bind(md4Hasher);
    md4Hasher.digest = (encoding) => {
      return Buffer.from(origDigest(encoding)).toString(encoding);
    };

    return md4Hasher;
  }
  return createHash(algo);
}).bind(newCrypto);

module.exports = newCrypto;
