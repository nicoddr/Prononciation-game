# French Prononciation

Jeu HTML en pixel art, jouable sur téléphone en format vertical. Le but : prononcer correctement des mots français pour faire tomber les méchants et atteindre le boss final au Stade de France.

## Contenu du jeu

- 5 niveaux, 15 mots français et 5 cœurs (chaque erreur coûte un demi-cœur).
- Deux personnages jouables : **French B 1** et **French G 1**.
- Reconnaissance vocale en **français (fr-FR)** : maintenir le micro et prononcer le mot affiché au-dessus des ennemis.
- Bouton **REPEAT** pour réécouter le mot, avec la synthèse vocale française.
- Bouton **SKIP** pour faire tomber un ennemi, au prix d'un cœur complet.
- **Timer de 30 secondes** par ennemi : à zéro, perte d'un demi-cœur, puis le timer repart automatiquement.
- Animations Stand / Attaque / À terre pour tous les personnages.
- Musique de fond : `Music/1-3.mp3` dans les menus et les niveaux 1 à 3, `Music/4-5.mp3` pour les niveaux 4 et 5.
- Panneau **Settings** : musique ON/OFF et volume de 0 à 100 % (réglages sauvegardés).

## Lancer le jeu

Servir le dossier avec un serveur statique, par exemple l'extension **Live Server** de VS Code, puis ouvrir :

`http://localhost:.../index.html`

La reconnaissance vocale nécessite :

- **Chrome ou Edge** (Web Speech API) ;
- une page servie en **HTTPS** ou depuis **localhost** ;
- l'autorisation du microphone ;
- une connexion internet pour le service de reconnaissance vocale du navigateur.

Sur téléphone, `http://` avec une adresse IP locale ne permet pas d'utiliser le micro : il faut héberger le jeu en HTTPS (GitHub Pages, Netlify, etc.). Si la voix n'est pas disponible, un champ de saisie apparaît automatiquement pour taper le mot.

## Arborescence

- `index.html` — écran d'accueil
- `select.html` — choix du personnage
- `game.html` — jeu
- `styles/pixel.css` — charte graphique pixel art
- `js/core.js` — audio, musique, réglages, stockage local
- `js/game.js` — niveaux, timer, reconnaissance vocale, animations
- `Images/` — décors et sprites
- `Music/` — musiques de fond
