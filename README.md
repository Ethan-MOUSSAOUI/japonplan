# Carnet Japon 2026 — collaboratif temps réel

Carnet de voyage interactif (Tokyo · Fuji · Kyoto · Osaka · Nara · Hiroshima) que **plusieurs personnes éditent en même temps**, synchronisé en direct via **Socket.IO**.

## Fonctionnalités
- **Login** : pseudo + mot de passe partagé du voyage.
- **Collaboration temps réel** : chaque modification (titre, note, resto, planning, coche…) apparaît instantanément chez tout le monde.
- **Présence** : on voit qui est connecté (initiales en haut).
- **Explications partout** : chaque lieu (ancre + satellites) et chaque resto a son explication.
- **Restos cliquables** : chaque resto ouvre directement Google Maps.
- **Planning / trajet par jour** : bouton « 🚉 Planning / trajet » avec switch **Depuis Shinjuku / Depuis Ueno** (logique de trajet pré-remplie, stable, sans horaires) + un champ de notes du groupe à caler la veille.
- **Versions par jour** : chaque journée peut avoir plusieurs versions de plan (ex : « Plan principal », « Plan pluie »). Crée, renomme, supprime, bascule — chacun peut regarder la version qu'il veut, le contenu est partagé.
- **Photos** : glisser-déposer dans chaque jour.
- **Persistance** : tout est sauvegardé côté serveur dans `data.json`.

## Lancer le serveur
```bash
cd C:\Users\Ethan\Documents\persoprojet\japon
npm install      # une seule fois
npm start
```
Puis ouvre **http://localhost:3000**.

Mot de passe par défaut : `japon2026`.
Pour le changer (Windows PowerShell) :
```powershell
$env:TRIP_PASSWORD = "votremotdepasse"; npm start
```

## Collaborer à plusieurs
- **Même Wi-Fi** : les autres ouvrent `http://<ton-IP-locale>:3000` (l'IP s'affiche au démarrage du serveur). Pense à autoriser le port 3000 dans le pare-feu Windows.
- **À distance (internet)** : il faut exposer le serveur. Le plus simple sans config :
  ```bash
  npx localtunnel --port 3000
  ```
  ou un tunnel type `ngrok http 3000`, puis partage l'URL publique. Pour quelque chose de permanent, déploie sur Render / Railway / Fly.io (Node + un disque pour `data.json`).

## Mettre en ligne (accessible par tous, partout)

### Option A — tout de suite, temporaire (ton PC sert le site)
Lance le serveur (`npm start`), puis dans un autre terminal :
```bash
npx localtunnel --port 3000
```
Tu obtiens une URL publique `https://xxxx.loca.lt` à partager. Marche tant que ton PC tourne ; l'URL change à chaque fois. (Alternative : `ngrok http 3000`.)

### Option B — permanent, hébergé (recommandé) : Render.com
1. Mets le projet sur **GitHub** (repo privé OK).
2. Sur **render.com** → *New* → *Blueprint* → choisis ton repo. Render lit `render.yaml`.
3. Renseigne la variable `TRIP_PASSWORD` (le mot de passe du voyage).
4. Déploie → tu obtiens une URL fixe `https://carnet-japon-2026.onrender.com`.

**Persistance des données :** le bloc `disk` du `render.yaml` garde `data.json` entre les redémarrages, mais le disque exige le plan payant (~7 $/mois). Pour tester **gratuitement**, passe `plan: free` et retire le bloc `disk` — mais les données se réinitialisent quand le service se met en veille. (Alternatives d'hébergement : Railway, Fly.io, Glitch.)

## Mode hors-ligne
Si le serveur n'est pas lancé, la page propose « continuer hors-ligne » : tu peux éditer, mais les changements restent sur ton appareil (pas de partage).

## Fichiers
- `server.js` — serveur Express + Socket.IO (auth, synchro, présence, persistance).
- `public/index.html` — le carnet (client).
- `data.json` — créé automatiquement, contient les données partagées du voyage.
