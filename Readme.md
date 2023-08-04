# Dox Websocket client

## Installation

##### Via cdn

```
https://cdn.jsdelivr.net/npm/@dartondox/websocket/dist/index.js
```

##### Via npm or yarn

```bash
$ npm install @dartondox/websocket
```
OR
```
$ yarn add @dartondox/websocket
```

## Usage

```js
import DoxWebsocket from '@dartondox/websocket';

const socket = DoxWebsocket('ws://127.0.0.1:3001/ws', {
  maxRetries: 18, retryAfter: 2000 
})

socket.onConnected(() => {
  console.log(socket.id)
})

socket.onError(() => {
  console.log('socket error')
})

socket.on('intro', (msg) => {
  console.log(msg)
})

socket.onClose(() => {
  console.log('socket closed')
})

function send() {
  socket.emit('intro', { data: message.value })
}
```