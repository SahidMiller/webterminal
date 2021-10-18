import { 
  Server, 
  createServer, 
  normalizeServerArgs, 
  _normalizeArgs, 
  isIP, 
  isIPv4, 
  isIPv6 
} from "../net-serviceworker/index.js"

import { Socket, connect } from "./socket.js"

export {
  connect,
  connect as createConnection,
  Socket,
  Socket as Stream,

  _normalizeArgs,
  normalizeServerArgs,
  Server,
  createServer,
  isIP, 
  isIPv4, 
  isIPv6
}