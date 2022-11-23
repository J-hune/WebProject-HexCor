import {endGame} from "./endGame.js";

/**
 * Retourne tous les voisins d'un pion
 * @param {Number} pawn ID du pion
 * @param {Object} gameData  Taille du plateau
 * @return {Array.<number>} Liste des voisins
 */
function getNeighbours(pawn, gameData) {
   let size = gameData.gameBoardSize
   let neighbours = [pawn - (size - 1), pawn - size, pawn - 1, pawn + 1, pawn + (size - 1), pawn + size]

   if (gameData.edges.y0.includes(pawn)) neighbours = neighbours.filter(e => e !== pawn + (size - 1) & e !== pawn + size)
   if (gameData.edges.y1.includes(pawn)) neighbours = neighbours.filter(e => e !== pawn - (size - 1) && e !== pawn - size)

   if (gameData.edges.x0.includes(pawn)) neighbours = neighbours.filter(e => e !== pawn - 1 && e !== pawn + (size - 1))
   if (gameData.edges.x1.includes(pawn)) neighbours = neighbours.filter(e => e !== pawn + 1 && e !== pawn - size)


   return neighbours.filter(e => e >= 0 && e <= size * size - 1)
}

/**
 * Algorithme permettant de savoir si un joueur a gagné
 * @param io
 * @param gameData
 * @param {String} color Couleur du joueur
 * @param {String} axe Nom de l'axe e.g "x" ou "y"
 */
function checkWinner(io, gameData, color, axe) {
   let pawnsTreated = []
   let pawnsToTreat = []
   let oppositeEdgePawns;
   let playerPawns = gameData.pawns[color]

   /* Ici on sait :
        - Qu'il y a suffisamment de pions pour que le joueur soit gagnant
        - Que le joueur a au moins deux pions sur deux bords opposés (L'axe est représenté par "x" ou "y" dans la variable axe)
    */

   // On récupère tous les pions sur x0 ou y1 en fonction de l'axe gagnant
   // On les met ensuite dans notre file de pions à traiter.
   if (axe === "y") {
      pawnsToTreat = playerPawns.filter(e => e < gameData.gameBoardSize) //moins complexe qu'un include
      oppositeEdgePawns = gameData.edges.y0
   } else {
      pawnsToTreat = playerPawns.filter(e => gameData.edges.x0.includes(e)) //Ici par contre nous n'avons pas le choix
      oppositeEdgePawns = gameData.edges.x1
   }

   // On boucle sur la liste des pions à traiter
   while (pawnsToTreat.length > 0) {
      let pawn = pawnsToTreat.shift()

      // Si le pion est sur le bord opposé alors il y a un chemin i.e le joueur a gagné => fin du while.
      // On peut utiliser un break
      if (oppositeEdgePawns.includes(pawn)) return endGame(io, gameData, true, color)

      /* On parcourt la liste des voisins et on regarde deux choses :
            - Si le voisin n'a pas déjà été traité
            - S'il appartient au joueur
            Si true alors on l'ajoute à la file "pawnsToTreat"
         On marque ensuite le pion comme traité.
       */
      for (let neighbour of getNeighbours(pawn, gameData)) {
         if (!pawnsTreated.includes(neighbour) && playerPawns.includes(neighbour)) {
            pawnsToTreat.push(neighbour)
         }

         pawnsTreated.push(pawn)
      }
   }

   // Fin du While, aucun chemin trouvé, le joueur n'a pas gagné.

   // S'il ne reste plus aucun pion à placer => fin de partie, aucun gagnant
   const pawnsPlaced = Object.values(gameData.pawns).flat()
   if (pawnsPlaced.length === gameData.gameBoardSize * gameData.gameBoardSize) endGame(io, gameData, false)
}

/**
 * Retourne un boolean indiquant s'il faut vérifier si le joueur a gagné
 * @param io
 * @param {Object} gameData
 * @param {String} color
 */
export function needToCheckIfWinner(io, gameData, color) {
   let existPawnLeft = gameData.edges.x0.some(e => gameData.pawns[color].includes(e))
   let existPawnRight = gameData.edges.x1.some(e => gameData.pawns[color].includes(e))
   let existPawnBottom = gameData.edges.y0.some(e => gameData.pawns[color].includes(e))
   let existPawnTop = gameData.edges.y1.some(e => gameData.pawns[color].includes(e))

   if (existPawnLeft && existPawnRight) checkWinner(io, gameData, color, "x")
   if (existPawnBottom && existPawnTop) checkWinner(io, gameData, color, "y")
}