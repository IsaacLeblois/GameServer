// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let players = {};

wss.on('connection', function connection(ws) {
  const id = Math.random().toString(36).substr(2, 9);
  // Inicializa jugador con posición y nombre vacío
  players[id] = { x: 100, y: 100, name: "Anon" };

  // Enviar mensaje inicial con id y jugadores actuales
  ws.send(JSON.stringify({ type: 'init', id, players }));

  ws.on('message', function incoming(message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error('Mensaje inválido:', message);
      return;
    }

    if (data.type === 'move') {
      // Actualiza posición, asegurando que el jugador exista
      if(players[id]) {
        players[id].x += data.dx;
        players[id].y += data.dy;
      }
    }
    else if (data.type === 'setName') {
      // Asigna el nombre recibido, limitado a 12 caracteres
      if(players[id] && typeof data.name === 'string') {
        players[id].name = data.name.substring(0, 12);
      }
    }
  });

  // Intervalo para enviar actualizaciones a este cliente
  const interval = setInterval(() => {
    if(ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'update', players }));
    }
  }, 100);

  ws.on('close', () => {
    delete players[id];
    clearInterval(interval);
  });
});

console.log('Servidor WebSocket iniciado en puerto 8080');
