import './style.css'
import { Player } from "./player.js"
import { renderBoard, disableBoard } from './renderer.js'

const playBtn = document.querySelector('button')
const boardOne = document.querySelector('.own-board')
const boardTwo = document.querySelector('.opponent-board')

// Start game
const playerOne = new Player()
const playerTwo = new Player()
playerOne.gameboard.placeShip('carrier', [0, 0], [4, 0])
playerOne.gameboard.placeShip('battleship', [1, 2], [1, 5])
playerOne.gameboard.placeShip('cruiser', [9, 0], [9, 2])
playerOne.gameboard.placeShip('submarine', [5, 4], [7, 4])
playerOne.gameboard.placeShip('destroyer', [1, 9], [2, 9])
playBtn.addEventListener('click', () => {
    playBtn.style.visibility = 'hidden'
    renderBoard(playerOne, boardOne)
    renderBoard(playerTwo, boardTwo)

    // Disable the player's board first
    disableBoard(boardOne, true)
})

// Add listeners to each board to play in turns
boardOne.addEventListener('click', () => {
    disableBoard(boardOne, true)
    disableBoard(boardTwo, false)

    // End game
    if (playerOne.gameboard.fleetIsSunk()) {
        disableBoard(boardTwo, true)
        console.log('Player two wins!')
    }
})

boardTwo.addEventListener('click', () => {
    disableBoard(boardTwo, true)
    disableBoard(boardOne, false)

    if (playerTwo.gameboard.fleetIsSunk()) {
        disableBoard(boardOne, true)
        console.log('Player one wins!')
    }
})