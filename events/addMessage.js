/**
 * Event reçu quand quelqu'un appuie sur le bouton "envoyer"
 * @param io
 * @param socket
 * @param gameData
 * @param {Object} gameMessages
 * @param {Object} params
 */
export function addMessage(io, socket, gameData, gameMessages, params) {
   const message = {
      authorID: socket.id,
      author: gameData.players?.[socket.id]?.name || "Anon",
      date: Date.now(),
      message: params.message
   }

   gameMessages.push(message)
   io.sockets.emit("newMessage", {...message, color: gameData.players?.[socket.id]?.type})
}