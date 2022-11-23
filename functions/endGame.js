/**
 * Fin de la partie (quelqu'un a gagné ou il ne reste plus aucun pion)
 * @param io
 * @param gameData
 * @param {Boolean} win
 * @param {String=} winner Couleur du gagnant (s'il y a)
 */
export function endGame(io, gameData, win, winner) {
   gameData.gameEnded = true

   if (win) {
      io.sockets.emit("stopGame", {color: winner, pawns: gameData.pawns[winner].length})
   } else {
      io.sockets.emit("stopGame")
   }

   setTimeout(() => {
      Object.keys(gameData).map(key => delete gameData[key]);
      io.sockets.emit("loadGame", {})
   }, 10000);
}