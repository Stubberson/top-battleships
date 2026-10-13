import './style.css'
import { Player } from './player.js'

// Create HTML representation of the board
function renderBoard(player, boardElement) {
    for (let row = 0; row < player.gameboard.board.length; row++) {
        let rowElem = document.createElement('div')
        rowElem.className = 'board-row'
        for (let col = 0; col < player.gameboard.board[row].length; col++) {
            let cellElem = document.createElement('div')
            switch (player.gameboard.board[row][col]) {
                case 2:
                    cellElem.className = 'ship'
                    break
                case 1:
                    cellElem.classList.add('hit')
                    break
                case 0:  // This is kinda redundant
                    cellElem.className = 'empty'
                    break
                case -1:
                    cellElem.className = 'miss'
                    break
            }

            if (boardElement.classList.contains('opponent-board')) {
                cellElem.addEventListener('click', () => {
                    player.gameboard.receiveAttack([col, row])
                    
                    // Refresh the opponent's board
                    while (boardElement.hasChildNodes()) {
                        boardElement.removeChild(boardElement.firstChild)
                    }
                    renderBoard(player, boardElement)
                })
            }
            
            rowElem.appendChild(cellElem)
        }
        boardElement.appendChild(rowElem)
    }
}


const playerOne = new Player()
let ownBoard = document.querySelector('.own-board')

playerOne.gameboard.placeShip('carrier', [0, 0], [4, 0])
playerOne.gameboard.placeShip('battleship', [3, 4], [3, 7])
playerOne.gameboard.placeShip('cruiser', [8, 0], [8, 2])
playerOne.gameboard.placeShip('submarine', [7, 6], [9, 6])
playerOne.gameboard.placeShip('destroyer', [3, 9], [4, 9])

// Create HTML for player two / computer
const playerTwo = new Player()
let opponentBoard = document.querySelector('.opponent-board')

playerTwo.gameboard.placeShip('carrier', [1, 5], [1, 9])
playerTwo.gameboard.placeShip('battleship', [6, 1], [9, 1])
playerTwo.gameboard.placeShip('cruiser', [2, 3], [4, 3])
playerTwo.gameboard.placeShip('submarine', [7, 4], [9, 4])
playerTwo.gameboard.placeShip('destroyer', [3, 8], [3, 9])

renderBoard(playerOne, ownBoard)
renderBoard(playerTwo, opponentBoard)