import { FS_REQUEST_SUCCEEDED, FS_REQUEST_FAILED } from "../actions.js"
import xhr from "xhr"

function uid() {
  return Array.from({ length: 128 / 16 }, () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  ).join('');
}

export default function syncFsRequest(data) {
  let error, response;

  const id = uid();

  xhr({
    method: "post",
    //Prevent caching from firefox
    body: JSON.stringify({ 
      methods: data,
      id: id
    }),
    uri: `/fs?id=${id}`,
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
