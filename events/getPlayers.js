/**
 * Event reçu quand un utilisateur quand il arrive pendant une partie en cours
 * @param socket
 * @param {Object} GameData
 */
export function getPlayers(socket, GameData) {
   socket.emit('playerListUpdated', GameData.players)
}