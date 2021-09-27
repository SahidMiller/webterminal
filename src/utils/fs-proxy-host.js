import fs from "fs"

export default async function fsProxyHost(interceptedMethods) {
  let result = fs;
  const doDebug = true
  
  if (doDebug) {
    console.log("Starting", interceptedMethods)
  }

  interceptedMethods.forEach((method, index) => {
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