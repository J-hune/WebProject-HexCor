import {needToCheckIfWinner} from "../functions/checkWinner.js";

/**
 * Event reçu quand un utilisateur clique sur un hexagone du plateau
 * @param io
 * @param socket
 * @param {Object} gameData
 * @param {Object} params  Id du pion à ajouter e.g {id: 0}
 */
export function addPawn(io, socket, gameData, params) {
   if (!Object.keys(gameData).length) return;

   //Event ignoré si la partie est terminée
   if (gameData.gameEnded) return socket.emit("error", {error: "La partie est terminée, vous ne pouvez pas placer de pions"})
   if (!gameData.players[socket.id]) return socket.emit("error", {error: "Vous devez entrer dans la partie pour jouer"})

   const color = gameData.players[socket.id].type

   //Vérification que le joueur n'est pas spec et que c'est à son tour de jouer
   if (!gameData.pawns[color]) return socket.emit("error", {error: "Vous êtes spectateur, vous ne pouvez pas participer à la partie"})
   if (gameData.playerOrder[0] !== color) {
      return socket.emit("error", {error: "Ce n'est pas à votre tour de jouer, c'est au tour du joueur " + gameData.playerOrder[0]})
   }

   //Vérification que le pion n'est pas déjà posé
   const pawnAtThisPlace = Object.keys(gameData.pawns).find(key => gameData.pawns[key].includes(params.id))
   const corridorAtThisPlace = gameData.corridors.includes(params.id)
   if (pawnAtThisPlace || corridorAtThisPlace) {
      return socket.emit("error", {error: "Le pion appartient déjà à quelqu'un"})
   }

   //Si le pion n'est pas un corridor
   if (!params.type) {

      //Le pion est ajouté à l'utilisateur et un event est émis pour modifier le front
      gameData.pawns[color].push(params.id)
      io.sockets.emit("pawnPlaced", {id: params.id, color: color})
   } else {

      //Le corridor est ajouté à l'utilisateur et un event est émis pour modifier le front
      gameData.corridors.push({id: params.id, type: params.type, color: color})
      io.sockets.emit("pawnPlaced", {id: params.id, type: params.type})
   }

   //Le joueur vient de jouer, il est placé en dernier dans la file
   gameData.playerOrder.push(gameData.playerOrder.shift());

   //Vérification si le joueur a gagné
   if (gameData.pawns[color].length + gameData.corridors.length >= gameData.gameBoardSize) needToCheckIfWinner(io, gameData, color)
}