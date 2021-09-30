import { FS_REQUEST_SUCCEEDED, FS_REQUEST_FAILED } from "../actions.js"
import xhr from "xhr"

export default function syncFsRequest(data) {
  let error, response;

  xhr({
    method: "post",
    body: JSON.stringify(data),
    uri: "/fs",
    headers: {
      "Content-Type": "application/json"
    },
    sync: true
  }, (err, resp, body) => {
    
    try {
      const { action, payload } = JSON.parse(body);
      if (action === FS_REQUEST_SUCCEEDED) {
        response = payload;
        return response
      } else if (action === FS_REQUEST_FAILED) {
        error = payload;
        return error
      }
    } catch (err) {
      error = "fs-proxy-client failed to get a valid response"
    }
  })

  if(error) {
    throw error
  }
  
  return response
}
