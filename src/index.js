import './style.css'
import { Player } from "./player.js"
import { renderBoard, disableBoard } from './renderer.js'
import { computerAttack } from './computer-behaviour.js'

const playBtn = document.querySelector('button')
const boardOne = document.querySelector('.own-board')
const boardTwo = document.querySelector('.opponent-board')

// Start game
const playerOne = new Player()
const playerTwo = new Player()

// TODO - for now, just populate the boards
playerOne.gameboard.placeShip('carrier', [0, 0], [4, 0])
playerOne.gameboard.placeShip('battleship', [1, 2], [1, 5])
playerOne.gameboard.placeShip('cruiser', [9, 0], [9, 2])
playerOne.gameboard.placeShip('submarine', [5, 4], [7, 4])
playerOne.gameboard.placeShip('destroyer', [1, 9], [2, 9])

playerTwo.gameboard.placeShip('carrier', [6, 1], [6, 5])
playerTwo.gameboard.placeShip('battleship', [8, 0], [8, 3])
playerTwo.gameboard.placeShip('cruiser', [1, 1], [3, 1])
playerTwo.gameboard.placeShip('submarine', [2, 4], [2, 6])
playerTwo.gameboard.placeShip('destroyer', [5, 8], [6, 8])

// Render the boards for the first time
renderBoard(playerOne, boardOne)
renderBoard(playerTwo, boardTwo)
disableBoard(boardOne, true)
disableBoard(boardTwo, true)

playBtn.addEventListener('click', () => {
    // TODO
    playBtn.style.visibility = 'hidden'
    // Disable the player's board first
    disableBoard(boardTwo, false)
})

// Add listeners to each board to play in turns
boardOne.addEventListener('click', () => {
    disableBoard(boardOne, true)
    disableBoard(boardTwo, false)

    // End game
    if (playerOne.gameboard.fleetIsSunk()) {
        disableBoard(boardTwo, true)
        // TODO
        console.log('Computer wins!')
        playBtn.innerText = 'Play again!'
        playBtn.style.visibility = 'visible'
    }
})

boardTwo.addEventListener('click', () => {
    disableBoard(boardTwo, true)
    disableBoard(boardOne, false)

    if (playerTwo.gameboard.fleetIsSunk()) {
        disableBoard(boardOne, true)
        // TODO
        console.log('You win!')
        playBtn.innerText = 'Play again!'
        playBtn.style.visibility = 'visible'
    } else {
        setTimeout(() => {
            computerAttack(boardOne)
        }, 1000)
    }
})