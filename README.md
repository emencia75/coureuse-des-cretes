# Coureuse des Crêtes

Jeu 3D de trail dans le navigateur (Three.js r128) : dévale 900 m de sentier de montagne, saute troncs, racines et marmottes, esquive rochers, cerfs, bouquetins, chutes de pierres et grosses flaques, et dépasse sept concurrentes.

## Jouer

Ouvre `index.html` via un petit serveur local (la musique se charge en relatif) :

```sh
python3 -m http.server 8000
# puis http://localhost:8000
```

Fonctionne aussi avec GitHub Pages (Settings → Pages → branche `main`, dossier racine).

## Commandes

| Touche | Action |
| --- | --- |
| ← → ou A/D (Q/D en AZERTY) | se déplacer |
| Espace | sauter |
| ↑ | sprinter (consomme l’énergie) |
| ↓ | freiner |
| Échap | pause |

Sur mobile, des boutons tactiles s’affichent.

## Classement

Hors de claude.ai, le classement est enregistré dans le navigateur (localStorage). Publié comme artifact claude.ai, il devient partagé entre les joueurs.

## Musique

`run-the-ridge.mp3` — « Run the Ridge », fournie par l’auteur du projet.
