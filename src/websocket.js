import { wsServer, debug } from './utils.js';

// Cette fonction permet d'installer un websocket natif navigateur en écoute
// https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
// A chaque message recu, le callback sera appellé avec son contenu
// eslint-disable-next-line no-unused-vars
function webSocket(callbackOnMessage) {
  // Server's address
  // const socket = new WebSocket('ws://localhost:3000/stream/');
  // const socket = new WebSocket('wss://lifap5.univ-lyon1.fr:443/stream/');
  const socket = new WebSocket(wsServer);

  debug(`@webSocket`);
  // the global heartbeat's ID
  let heartbeatInterval;

  // Connection opened
  socket.onopen = (event) => {
    // Set some heartbeat to the server. WebSocket native API does not support ping yet.
    // Nginx's timeout is 60s, so we take the half
    debug(`@webSocket.onopen(${JSON.stringify(event)})`);
    heartbeatInterval = setInterval(() => {
      const heartbeat = { type: 'heartbeat', time: Date.now() };
      console.info(`@webSocket.send(${JSON.stringify(heartbeat)})`);
      socket.send(JSON.stringify(heartbeat));
    }, 30000);
  };

  // Connection closed
  socket.onclose = (event) => {
    clearInterval(heartbeatInterval);
    debug(`@webSocket.onclose(${event.code})`);
  };

  // Listen for messages
  socket.onmessage = (event) => {
    debug(`@webSocket.onmessage(${event.data})`);
    callbackOnMessage(JSON.parse(event.data));
  };

  window.addEventListener('beforeunload', () => {
    // here a 1005 code is sent
    clearInterval(heartbeatInterval);
    socket.close();
  });

  function sendMessage(msg) {
    if (socket.readyState === WebSocket.OPEN) {
      debug(`@webSocket.sendMessage@${JSON.stringify(msg)}`);
      // See https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
      socket.send(JSON.stringify(msg));
    } else console.error(`@webSocket.sendMessage: state is ${socket.readyState}`);
  }

  return sendMessage;
}

export { webSocket };
