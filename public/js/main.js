const socket = io();

/* Reçu lors :
      - du load de la page,
      - quand quelqu'un clique sur "nouvelle partie"
      - quand la partie est finie (10sec après une win)
 */
socket.on('loadGame', async data => {
   //On vide #gameInfos (si la partie vient de se finir)
   const node = document.getElementById("gameInfos")
   node.innerHTML = ''

   if (Object.keys(data).length === 0) {
      //Suppression du svg dans #tablier (si la partie vient de se finir)
      const tablier = document.getElementById("tablier")
      tablier.innerHTML = ''

      //Ajout du html permettant de créer une partie
      const resp = await fetch("newGame.html");
      const html = await resp.text();
      node.insertAdjacentHTML("afterbegin", html);

   } else {
      //Ajout du html permettant de rejoindre la partie
      const resp = await fetch("board.html");
      const html = await resp.text();
      node.insertAdjacentHTML("afterbegin", html);

      // Ajout eventListener input nom (pour la fluidité)
      const nameInput = document.getElementById("nom");

      nameInput.addEventListener("keypress", function(event) {
         if (event.key === "Enter") {
            event.preventDefault();
            entrerDansLaPartie();
            document.activeElement.blur();
         }
      });

      //Génération du tablier
      generateDamier(20, data.gameBoardSize, data.gameBoardSize);

      socket.emit('getPlayers');
      socket.emit('getPawns');
      document.getElementById("nom").focus();
   }
})

// Reçu lors du load de la page
socket.on('loadMessages', data => {
   // On boucle sur les messages à afficher (
   for (let messageData of data) {
      const message = document.createElement("div")

      //Si on connait la couleur du joueur, on l'affiche
      if (messageData.color) {
         const messageValue = document.createTextNode(`${messageData.author} (${messageData.color}): ${messageData.message}`);
         message.appendChild(messageValue);
      } else {
         const messageValue = document.createTextNode(`${messageData.author}: ${messageData.message}`);
         message.appendChild(messageValue);
      }

      document.getElementById("message-list").append(message)
   }

   removeOldMessage();
})

// Reçu lorsqu'un joueur quitte out rejoint la partie
socket.on('playerListUpdated', data => {
   // On formate nos données : Object list -> String list -> String
   const players = Object.values(data).map(e => `${e.name} (${e.type})`)
   document.getElementById("listeJoueurs").innerHTML = players.join(", ")

   // Si l'utilisateur est joueur, il peut quitter la partie
   // Sinon il peut modifier son nom et la rejoindre
   if (data[socket.id]) {
      document.getElementById('joinGame').disabled = true
      document.getElementById('leaveGame').disabled = false
      document.getElementById('nom').disabled = true
   } else {
      document.getElementById('joinGame').disabled = false
      document.getElementById('leaveGame').disabled = true
      document.getElementById('nom').disabled = false
   }
});

// Reçu après le load de la page (si une partie est en cours)
socket.on('pawnsList', data => {
   for (let color of Object.keys(data)) {

      // Boucle sur les pions et modification de l'attribut css "fill" avec la couleur du joueur
      for (let pawn of data[color]) {
         const hexa = document.getElementById("h" + pawn)
         hexa.style.fill = color;
      }
   }
});

// Reçu quand un pion est placé
socket.on('pawnPlaced', data => {
   console.log(`Le pion ${data.id} vient d'être placé (${data.color})`)

   const hexa = document.getElementById("h" + data.id)
   hexa.style.fill = data.color;
})

// Reçu quand la partie est terminée
socket.on('stopGame', data => {
   // On bloque les boutons pour montrer que l'utilisateur n'y a pas accès
   document.getElementById('joinGame').disabled = true
   document.getElementById('leaveGame').disabled = true
   document.getElementById('nom').disabled = true

   const message = document.createElement("div")

   if(data) {
      const messageValue = document.createTextNode(`WINNER! Le joueur ${data.color} vient de gagner avec ${data.pawns} pions`);
      message.appendChild(messageValue);

      // Affichage dans la console
      console.log(`WINNER! Le joueur ${data.color} vient de gagner avec ${data.pawns} pions`)
   } else {
      const messageValue = document.createTextNode(`FIN DE PARTIE! Aucun joueur n'a gagné`);
      message.appendChild(messageValue);

      // Affichage dans la console
      console.log(`FIN DE PARTIE! Aucun joueur n'a gagné`)
   }

   // Affichage dans la liste des messages
   document.getElementById("message-list").append(message)
})

// Reçu quand un message est envoyé
socket.on('newMessage', data => {
   const message = document.createElement("div")
   if (data.color) {
      const messageValue = document.createTextNode(`${data.author} (${data.color}): ${data.message}`);
      message.appendChild(messageValue);
   } else {
      const messageValue = document.createTextNode(`${data.author}: ${data.message}`);
      message.appendChild(messageValue);
   }

   document.getElementById("message-list").append(message)
   removeOldMessage();
})

socket.on('error', data => {
   console.error(data.error)
})

function pickRandomName() {
   const characters = [
      "Gon Freecss", "Kirua Zoldik", "Kurapika", "Leolio", "Hisoka",
      "Irumi Zoldik", "Kaito", "Ging Freecss", "Isaac Netero", "Silva Zoldik",
      "Miruki Zoldik", "Aruka Zoldik", "Kuroro Lucifer", "Meruem", "Komugi"
   ]
   return characters[Math.floor(Math.random() * characters.length)];
}

function nouvellePartie() {
   const joueurs = document.getElementById("nbJoueurs").value
   const taille = document.getElementById("tailleTablier").value

   socket.emit("newGame", {users: joueurs, size: taille})
}

function entrerDansLaPartie() {
   const input = document.getElementById("nom")
   let nom = input.value

   if (!nom.trim()) {
      nom = pickRandomName()
      input.value = nom
   }

   socket.emit('addPlayer', {name: nom});
}

function quitterLaPartie() {
   socket.emit('removePlayer');
}

function handleClickHexa(id) {
   const hexa = document.getElementById("h" + id)
   if (!!hexa.style.fill) return;

   socket.emit('addPawn', {id: id});
}

function creeHexagone(rayon) {
   let points = []
   for (let i = 0; i < 6; ++i) {
      let angle = i * Math.PI / 3;
      let x = Math.sin(angle) * rayon;
      let y = -Math.cos(angle) * rayon;
      points.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
   }
   return points;
}

function generateDamier(rayon, nbLignes, nbColonnes) {
   const distance = rayon - (Math.sin(Math.PI / 3) * rayon);  // plus grande distance entre l'hexagone et le cercle circonscrit

   d3.select("#tablier")
      .append("svg")
      .attr("width", 1.8 * rayon * nbLignes + 0.82 * rayon * nbColonnes)
      .attr("height", nbLignes * 2 * rayon);

   const hexagone = creeHexagone(rayon);
   for (let ligne = 0; ligne < nbLignes; ligne++) {
      for (let colonne = 0; colonne < nbColonnes; colonne++) {
         let d = "";
         let x, y;
         const id = ligne * nbLignes + colonne

         for (let h in hexagone) {
            x = hexagone[h][0] + (rayon - distance) * (2 + 2 * colonne) + (0.5 * ligne * rayon * Math.sqrt(3));
            y = distance * 2 + hexagone[h][1] + (rayon - distance * 2) * (1 + 2 * ligne);
            if (h === "0") d += "M" + x + "," + y + " L";
            else d += x + "," + y + " ";
         }
         d += "Z";
         d3.select("svg")
            .append("path")
            .attr("d", d)
            .attr("stroke", "black")
            .attr("fill", "white")
            .attr("id", "h" + id)
            .on("click", function (d) {
               handleClickHexa(id)
            });
      }
   }
}

function sendMessage() {
   const input = document.getElementById("message")
   const message = input.value.trim()

   // Si le message trim est vide return
   if (!message) return

   input.value = ''
   input.focus();
   socket.emit("addMessage", {message: message})
}

function removeOldMessage() {
   const container = document.getElementById("message-list")

   // Tant qu'un element (ici des divs) dépasse du cadre, le premier est supprimé.
   // C'est la meilleure solution que j'ai trouvée vu qu'on n'a pas le droit à "overflow: scroll;"
   while (container.scrollHeight > container.offsetHeight) {
      container.removeChild(container.firstElementChild);
   }
}

window.addEventListener('load', () => {
   socket.emit("getGame")
   socket.emit("getMessages")

   // Ajout eventListener input tchat (pour la fluidité)
   const tchatInput = document.getElementById("message");

   tchatInput.addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
         event.preventDefault();
         sendMessage();
      }
   });
});