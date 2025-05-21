// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let players = {};

wss.on('connection', function connection(ws) {
  const id = Math.random().toString(36).substr(2, 9);
  players[id] = { x: 100, y: 100, name: "Anon" };

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
      if (players[id]) {
        players[id].x += data.dx;
        players[id].y += data.dy;
      }
    }
    else if (data.type === 'setName') {
      if (players[id] && typeof data.name === 'string') {
        players[id].name = data.name.substring(0, 12);
      }
    }
    else if (data.type === 'say') {
      if (typeof data.message === 'string' && data.message.trim() !== '') {
        const msg = data.message.substring(0, 50); // Limitar longitud

        if (players[id]) {
          players[id].message = msg;

          // Reenviar a todos los clientes
          broadcast({
            type: 'say',
            id,
            message: msg
          });

          // Borrar mensaje después de 4 segundos
          setTimeout(() => {
            if (players[id]) {
              delete players[id].message;
            }
          }, 4000);
        }
      }
    }
  });

  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const slimPlayers = {};
      for (let pid in players) {
        const { x, y, name, message } = players[pid];
        slimPlayers[pid] = { x, y, name };
        if (message) slimPlayers[pid].message = message;
      }

      ws.send(JSON.stringify({ type: 'update', players: slimPlayers }));
    }
  }, 100);

  ws.on('close', () => {
    delete players[id];
    clearInterval(interval);
  });
});

// Función para enviar a todos
function broadcast(data) {
  const json = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

console.log('Servidor WebSocket iniciado en puerto 8080');
