> XTerm.js based Webterminal utilizing ServiceWorker + WebWorkers for a "more suckless" web

### Install
 1. git pull https://github.com/SahidMiller/webterminal
 2. yarn install
 3. npx webpack
 4. cd ./dist
 5. http-server -p 8082 (or whatever you use for static http server)
 6. open up once. then refresh if it takes too long (hangs sometimes when the SW is updated in between)
