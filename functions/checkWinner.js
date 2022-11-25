import {endGame} from "./endGame.js";

/**
 * Retourne tous les voisins d'un pion
 * @param {Number} pawn ID du pion
 * @param {Object} gameData  Taille du plateau
 * @return {Array.<number>} Liste des voisins
 */
function getNeighbours(pawn, gameData) {
   let size = gameData.gameBoardSize

   const corridor = gameData.corridors.find(e => e.id === pawn)
   let neighbours = []

   //Si le pion actuel est un corridor
   if (corridor) {
      if (corridor.type === "OE") neighbours = [pawn - 1, pawn + 1]
      else if (corridor.type === "NOSE") neighbours = [pawn - (size - 1), pawn + size]
      else if (corridor.type === "NESO") neighbours = [pawn - size, pawn + (size - 1)]
   } else {
      neighbours = [pawn - (size - 1), pawn - size, pawn - 1, pawn + 1, pawn + (size - 1), pawn + size]
   }

   if (gameData.edges.y0.includes(pawn)) neighbours = neighbours.filter(e => e !== pawn + (size - 1) & e !== pawn + size)
   if (gameData.edges.y1.includes(pawn)) neighbours = neighbours.filter(e => e !== pawn - (size - 1) && e !== pawn - size)

   if (gameData.edges.x0.includes(pawn)) neighbours = neighbours.filter(e => e !== pawn - 1 && e !== pawn + (size - 1))
   if (gameData.edges.x1.includes(pawn)) neighbours = neighbours.filter(e => e !== pawn + 1 && e !== pawn - size)

   //Filtre des voisins corridors pour garder uniquement ceux valides
   neighbours = neighbours.filter(e => e >= 0 && e <= size * size - 1)
      .filter(e => {
         let isCorridor = gameData.corridors.find(f => f.id === e)
         if (!isCorridor) return true;

         if (isCorridor.type === "OE" && (e === pawn - 1 || e === pawn + 1)) return true
         if (isCorridor.type === "NOSE" && (e === pawn + size || e === pawn - size)) return true
         return isCorridor.type === "NESO" && (e === pawn + (size - 1) || e === pawn - (size - 1));
      })
   return neighbours
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
   let pawnsToTreat;
   let oppositeEdgePawns;
   let playerPawns = gameData.pawns[color].concat(gameData.corridors.map(e => e.id))

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
   const pawnsPlaced = Object.values(gameData.pawns).flat().concat(gameData.corridors.map(e => e.id))
   if (pawnsPlaced.length === gameData.gameBoardSize * gameData.gameBoardSize) endGame(io, gameData, false)
}

/**
 * Retourne un boolean indiquant s'il faut vérifier si le joueur a gagné
 * @param io
 * @param {Object} gameData
 * @param {String} color
 */
export function needToCheckIfWinner(io, gameData, color) {
   const existPawnLeft = gameData.edges.x0.some(e => gameData.pawns[color].includes(e) || gameData.corridors.find(f => f.id === e))
   const existPawnRight = gameData.edges.x1.some(e => gameData.pawns[color].includes(e) || gameData.corridors.find(f => f.id === e))
   const existPawnBottom = gameData.edges.y0.some(e => gameData.pawns[color].includes(e) || gameData.corridors.find(f => f.id === e))
   const existPawnTop = gameData.edges.y1.some(e => gameData.pawns[color].includes(e) || gameData.corridors.find(f => f.id === e))

   // On calcule le nombre de corridors posés (le minimum des 3)
   // On vérifie ensuite si le nombre minimum de corridors est respecté (lignes 121-122)
   const numberOfCorridors = Math.min(
      gameData.corridors.filter(e => e.type === "OE" && e.color === color).length,
      gameData.corridors.filter(e => e.type === "NOSE" && e.color === color).length,
      gameData.corridors.filter(e => e.type === "NESO" && e.color === color).length,
   )

   const pawnsPlaced = Object.values(gameData.pawns).flat().concat(gameData.corridors.map(e => e.id))
   const maxPawnPlaced = pawnsPlaced.length === gameData.gameBoardSize * gameData.gameBoardSize

   // S'il ne reste plus de place et qu'il manque des corridors alors on déclenche la fin de la partie
   if (maxPawnPlaced && numberOfCorridors < gameData.numberOfCorridors) return endGame(io, gameData, false)

   if (existPawnLeft && existPawnRight && numberOfCorridors >= gameData.numberOfCorridors) checkWinner(io, gameData, color, "x")
   else if (existPawnBottom && existPawnTop && numberOfCorridors >= gameData.numberOfCorridors) checkWinner(io, gameData, color, "y")
}