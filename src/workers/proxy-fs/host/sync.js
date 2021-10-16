import { FS_REQUEST_SUCCEEDED, FS_REQUEST_FAILED } from "../actions.js"
import fs from "fs"

async function fsProxyHost({ methods }) {
  let result = fs;
  const doDebug = true
  
  if (doDebug) {
    console.log("Starting", methods)
  }

  methods.forEach((method, index) => {
    const { key, args } = method;
    
    if (doDebug) {
      console.log(key, args)
    }

    if (key === "default" && index === 0) {
      result = fs;
    } else {
      const proxy = result[key]
      result = typeof proxy === 'function' ? proxy.apply(result, args) : proxy;
    }

    if (doDebug) {
      console.log(result)
    }
  });

  return result
}

export async function createSyncResponse(e) {

  const url = new URL(e.request.url)

  if (url.host !== self.location.host) return;

  if (url.pathname === "/fs") {
    let data;
    
    return e.request.json()
      .then(json => {
        data = json;
        return fsProxyHost(json);
      })
      .then(res => {
        let response
        try {
          response = JSON.stringify({ action: FS_REQUEST_SUCCEEDED, payload: res });
        } catch (err) {
          //Unserializable response
          response = JSON.stringify({ action: FS_REQUEST_SUCCEEDED, payload: undefined, unserializable: true });
        }

        return new Response(response, { status: 200 });
      })
      .catch(err => {
        console.log(FS_REQUEST_FAILED, err, data);
        let response 
        try {
          response = JSON.stringify({ action: FS_REQUEST_FAILED, payload: err });
        } finally {
          return new Response(response || "unknown error", { status: 500 });
        }
      })
  }
}