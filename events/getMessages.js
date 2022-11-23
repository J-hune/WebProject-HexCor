/**
 * Event reçu quand un utilisateur load la page
 * @param socket
 * @param gameData
 * @param {Object} gameMessages
 */
export function getMessages(socket, gameData, gameMessages) {

   /* On envoie uniquement les 20 derniers messages
      20 correspond au max de messages qui peuvent rentrer dans la div :
      (taille de la div / (taille minimale d'un message + margin * 2))
      600 / (18 + 6 * 2) = 20
    */
   socket.emit("loadMessages", gameMessages.slice(-20).map(e => {
      return {...e, color: gameData.players?.[e.authorID]?.type}
   }))
}