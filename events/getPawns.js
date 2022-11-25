/**
 * Event reçu quand un utilisateur quand il arrive pendant une partie en cours
 * @param socket
 * @param {Object} GameData
 */
export function getPawns(socket, GameData) {
   socket.emit('pawnsList', {pawns: GameData.pawns, corridors: GameData.corridors})
}