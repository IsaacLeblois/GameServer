// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let players = {};
let bullets = []; // Balas globales

function randomSpawn() {
  return {
    x: 80 + Math.random() * 600,
    y: 80 + Math.random() * 400
  };
}

wss.on('connection', function connection(ws) {
  const id = Math.random().toString(36).substr(2, 9);
  const spawn = randomSpawn();
  players[id] = { x: spawn.x, y: spawn.y, name: "Anon", hp: 100 };

  ws.send(JSON.stringify({ type: 'init', id, players, bullets }));

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
    else if (data.type === 'shoot') {
      // Recibe una bala del cliente y la agrega al array global
      if (players[id] && typeof data.bullet === 'object') {
        const b = data.bullet;
        // Adjunta el id del dueño
        bullets.push({
          x: b.x, y: b.y,
          dx: b.dx, dy: b.dy,
          life: 500,
          owner: id
        });
      }
    }
  });

  const interval = setInterval(() => {
    // --- Actualizar balas y detectar colisiones ---
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.dx;
      b.y += b.dy;
      b.life--;

      // Colisión con jugadores (no el dueño)
      for (let pid in players) {
        if (pid === b.owner) continue;
        const p = players[pid];
        if (
          b.x > p.x &&
          b.x < p.x + 24 &&
          b.y > p.y &&
          b.y < p.y + 24
        ) {
          // Quitar vida
          p.hp = Math.max(0, (p.hp || 100) - 34);
          // Reiniciar si hp <= 0
          if (p.hp <= 0) {
            const spawn = randomSpawn();
            p.x = spawn.x;
            p.y = spawn.y;
            p.hp = 100;
          }
          bullets.splice(i, 1);
          break;
        }
      }
      if (b.life <= 0 && bullets[i]) bullets.splice(i, 1);
    }

    // --- Enviar estado a cada cliente ---
    if (ws.readyState === WebSocket.OPEN) {
      const slimPlayers = {};
      for (let pid in players) {
        const { x, y, name, message, hp } = players[pid];
        slimPlayers[pid] = { x, y, name, hp: hp || 100 };
        if (message) slimPlayers[pid].message = message;
      }
      ws.send(JSON.stringify({ type: 'update', players: slimPlayers, bullets }));
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
