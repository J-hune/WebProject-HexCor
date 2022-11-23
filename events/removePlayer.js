/**
 * Event reçu quand un utilisateur clique sur "Quitter la partie"
 * @param io
 * @param socket
 * @param {Object} gameData
 */
export function removePlayer(io, socket, gameData) {
   //Vérification qu'une partie est en cours et que le joueur existe
   if (!Object.keys(gameData).length) return;

   //Event ignoré si la partie est terminée
   if (gameData.gameEnded) return socket.emit("error", {error: "La partie est terminée, vous ne pouvez pas la quitter"})

   if (!gameData.players[socket.id]) {
      return socket.emit("error", {error: "Vous devez entrer dans la partie pour jouer"})
   }

   //Ajout de la couleur du joueur dans la liste des couleurs dispo et suppression du joueur
   gameData.availableColors.push(gameData.players[socket.id].type)
   delete gameData.players[socket.id]

   //Vérification s'il y a un spectateur
   const nextPlayer = Object.keys(gameData.players).find(key => gameData.players[key].type === "spec")

   //Si oui le spectateur prend la première couleur disponible, il peut jouer
   if (nextPlayer) {
      const availablesColors = gameData.availableColors.length
      if (availablesColors !== 0) gameData.players[nextPlayer].type = gameData.availableColors.shift()
   }

   //Un event est émis pour modifier le front (la liste des joueurs)
   io.sockets.emit('playerListUpdated', gameData.players)
}