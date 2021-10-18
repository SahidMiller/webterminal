import net from "@network-stackify/stack/nets/generic/index.js";
const { connect, createConnection, Socket, Stream, normalizeServerArgs, _normalizeArgs, isIP, isIPv4, isIPv6 } = net;

import { Server, createServer } from "./server.js"

export {
  connect,
  createConnection,
  Socket,
  Stream,
  _normalizeArgs,
  normalizeServerArgs,
  Server,
  createServer,
  isIP, 
  isIPv4, 
  isIPv6
}