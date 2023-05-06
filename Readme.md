# Dox Websocket client

## Installation

##### Via cdn

```
https://cdn.jsdelivr.net/npm/@doxdart/websocket-client/dist/index.js
```

##### Via npm or yarn

```bash
$ npm install @doxdart/websocket-client
```
OR
```
$ yarn add @doxdart/websocket-client
```

## Usage

```js
import DoxWebsocket from '@doxdart/websocket-client';

const socket = DoxWebsocket('ws://localhost:3000/ws');

socket.onOpen(() => {
  socket.joinRoom('ABCD');
})

socket.onError(() => {
  console.log('socket error')
})

socket.on('intro', (data) => {
  console.log(data)
})

socket.onClose(() => {
  console.log('socket closed')
})

function send() {
  socket.emit('intro', {data: 'hello'});
}
```