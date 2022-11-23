/**
 * Event reçu quand un utilisateur clique sur "Entrer dans la partie"
 * @param io
 * @param socket
 * @param {Object} gameData
 * @param {Object} params nom du joueur e.g {name: "Anya forger"}
 */
export function addPlayer(io, socket, gameData, params) {
   //Vérification qu'une partie est en cours et que le joueur ne l'a pas déjà rejoint
   if (!Object.keys(gameData).length) return;

   //Event ignoré si la partie est terminée
   if (gameData.gameEnded) return socket.emit("error", {error: "La partie est terminée, vous ne pouvez pas entrer"})

   if (!!gameData.players[socket.id]) {
      return socket.emit('error', {error: "Vous êtes déjà en jeu"})
   }

   //Récupération des couleurs disponibles et ajout en mémoire du joueur
   const availablesColors = gameData.availableColors.length
   gameData.players[socket.id] = {
      name: params.name,
      type: availablesColors === 0 ? "spec" : gameData.availableColors.shift()
   }

   //Un event est émis pour modifier le front (la liste des joueurs)
   io.sockets.emit('playerListUpdated', gameData.players)
}