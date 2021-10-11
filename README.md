> XTerm.js based Webterminal utilizing ServiceWorker + WebWorkers for a "more suckless" web

### Install
 1. git pull https://github.com/SahidMiller/webterminal
 2. yarn install
 3. npx webpack
 4. cd ./dist
 5. http-server -p 8082 (or whatever you use for static http server)
 6. open up once. then refresh if it takes too long (hangs sometimes when the SW is updated in between)

## Usage

Browse the static page from step #5 above. (This package includes Yarn and IPFS CLI for demonstration.)

![Webterminal in the browser](https://user-images.githubusercontent.com/6362799/136827538-861f9ab2-7468-40f2-8c04-c0245a2e8ea0.png)

### For IPFS-CLI

Run the following in the webterminal:


1. ipfs init
1. ipfs config Addresses.API /ip4/127.0.0.1/tcp/8001
2. ipfs config Addresses.Gateway /ip4/127.0.0.1/tcp/8002
3. ipfs daemon
4. Browse `<host.domain:port>/gateway/ipfs/Qm...`

### For YARN

> not usable yet (hardcoded tunnel)
