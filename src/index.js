import './style.css'
import { Player } from "./player.js"
import { renderBoard, disableBoard } from './renderer.js'

const playBtn = document.querySelector('button')
const boardOne = document.querySelector('.own-board')
const boardTwo = document.querySelector('.opponent-board')

// Create players
const playerOne = new Player()
const playerTwo = new Player()

// TODO - for now, just populate the boards
playerOne.gameboard.placeShip('carrier', [0, 0], [4, 0])
playerOne.gameboard.placeShip('battleship', [1, 2], [1, 5])
playerOne.gameboard.placeShip('cruiser', [9, 0], [9, 2])
playerOne.gameboard.placeShip('submarine', [5, 4], [7, 4])
playerOne.gameboard.placeShip('destroyer', [1, 9], [2, 9])

renderBoard(playerOne, boardOne)
renderBoard(playerTwo, boardTwo)
disableBoard(boardOne, true)
disableBoard(boardTwo, true)

// Start game
playBtn.addEventListener('click', () => {
    playerTwo.placeComputerFleet()
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
            playerTwo.computerAttack(playerOne, boardOne)
        }, 1000)
    }
})