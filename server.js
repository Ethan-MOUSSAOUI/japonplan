/* ============================================================
   Carnet Japon 2026 — serveur collaboratif temps réel
   Express + Socket.IO
   - login : pseudo + mot de passe partagé du voyage
   - synchro : chaque champ édité est diffusé en direct à tous
   - présence : liste des personnes connectées
   - persistance : data.json (sauvegarde debouncée)
   ============================================================ */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
// Mot de passe partagé du voyage. Change-le via:  set TRIP_PASSWORD=tonmotdepasse  (Windows)
const TRIP_PASSWORD = process.env.TRIP_PASSWORD || 'japon2026';
// DATA_FILE configurable (utile en hébergement avec disque persistant)
const DATA_FILE = process.env.DATA_FILE || path.join(__dirname, 'data.json');

/* ---- état partagé (le "document" du carnet) ---- */
let state = {};
try {
  state = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log('Données chargées depuis data.json');
} catch (e) {
  state = {};
}

let saveTimer = null;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFile(DATA_FILE, JSON.stringify(state), err => {
      if (err) console.error('Erreur de sauvegarde:', err.message);
    });
  }, 400);
}

/* ---- web ---- */
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server);

function broadcastPresence() {
  const users = [];
  for (const [, s] of io.of('/').sockets) {
    if (s.data && s.data.name) users.push(s.data.name);
  }
  io.emit('presence', users);
}

io.on('connection', socket => {
  // tant que pas authentifié, on n'accepte rien d'autre que 'auth'
  socket.on('auth', payload => {
    payload = payload || {};
    if (payload.password !== TRIP_PASSWORD) {
      socket.emit('auth:fail');
      return;
    }
    socket.data.name = String(payload.name || 'Voyageur').trim().slice(0, 24) || 'Voyageur';
    socket.emit('auth:ok', { state, you: socket.data.name });
    broadcastPresence();
    console.log(`+ ${socket.data.name} connecté`);
  });

  socket.on('op', op => {
    if (!socket.data.name) return;                 // non authentifié
    if (!op || typeof op.fid !== 'string') return;
    state[op.fid] = op.value;
    persist();
    // diffuse à tous SAUF l'émetteur
    socket.broadcast.emit('op', { fid: op.fid, value: op.value, by: socket.data.name });
  });

  socket.on('disconnect', () => {
    if (socket.data.name) console.log(`- ${socket.data.name} déconnecté`);
    broadcastPresence();
  });
});

server.listen(PORT, () => {
  console.log('========================================');
  console.log(`  Carnet Japon 2026 — serveur lancé`);
  console.log(`  Local   : http://localhost:${PORT}`);
  console.log(`  Réseau  : http://<ton-IP-locale>:${PORT}  (pour les autres sur le même Wi-Fi)`);
  console.log(`  Mot de passe du voyage : ${TRIP_PASSWORD}`);
  console.log('========================================');
});
