/**
 * Calcul des angles en fonction de la taille du plateau
 * @param {Number} size
 * @return {Object} Dictionnaire contenant uniquement des tableaux/listes
 */
function getEdges(size) {
   let edges = {x0: [], x1: [], y0: [], y1: []}

   //Bords en bas
   for (let i = 1; i <= size; i++) {
      edges.y0.push(size * size - i)
   }

   //Bords en haut
   for (let i = 0; i < size; i++) {
      edges.y1.push(i)
   }

   //Bords à gauche
   for (let i = 0; i < size; i++) {
      edges.x0.push(i * size)
   }

   //Bords à droite
   for (let i = 0; i < size; i++) {
      edges.x1.push(i * size + 10)
   }

   return edges
}

/**
 * Event reçu quand un utilisateur clique sur "Lancer la partie"
 * @param io
 * @param socket
 * @param {Object} gameData
 * @param {Object} params Paramètres de la partie e.g {size: 11, users: 2}
 */
export function newGame(io, socket, gameData, params) {
   const colorList = ["crimson", "blue", "purple", "lightsalmon"]

   // Never trust user input
   if (!params.users || params.users > 4 || params.users < 2) params.users = 2
   if (!params.size || params.size > 20 || params.size < 1) params.size = 11

   gameData["availableColors"] = colorList.slice(0, params.users || 2)
   gameData["gameBoardSize"] = parseInt(params.size)
   gameData["players"] = {}
   gameData["pawns"] = Object.assign({}, ...colorList.map((x) => ({[x]: []})))
   gameData["edges"] = getEdges(parseInt(params.size))
   gameData["playerOrder"] = colorList.slice(0, params.users)
   gameData["gameEnded"] = false

   io.sockets.emit("loadGame", gameData)
}