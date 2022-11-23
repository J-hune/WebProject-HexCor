/**
 * Event reçu quand un utilisateur quitte la page
 * @param io
 * @param socket
 * @param {Object} gameData
 */
export function disconnect(io, socket, gameData) {
   //Vérification si une partie est en cours ou si le joueur est encore en mémoire
   if (!Object.keys(gameData).length || !gameData.players[socket.id]) return;

   //Event ignoré si la partie est terminée
   if (gameData.gameEnded) return;


   //Si le joueur n'était pas spec, la couleur est rendue
   const color = gameData.players[socket.id].type
   if (color !== "spec") gameData.availableColors.push(gameData.players[socket.id].type)

   //Le joueur est supprimé et un event est émis pour modifier le front
   delete gameData.players[socket.id]
   io.sockets.emit('playerListUpdated', gameData.players)
}