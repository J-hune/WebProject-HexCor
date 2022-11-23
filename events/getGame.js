/**
 * Event reçu quand un utilisateur load la page
 * @param socket
 * @param {Object} gameData
 */
export function getGame(socket, gameData) {
   socket.emit("loadGame", gameData)
}