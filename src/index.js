import './style.css'
import { Player } from "./player.js"
import { renderBoard, disableBoard } from './renderer.js'

const playBtn = document.querySelector('button')
const boardOne = document.querySelector('.own-board')
const boardTwo = document.querySelector('.opponent-board')

// create players
const playerOne = new Player()
const playerTwo = new Player()

renderBoard(playerOne, boardOne)
renderBoard(playerTwo, boardTwo)
disableBoard(boardOne, true)
disableBoard(boardTwo, true)

// play game
let rounds = 0
playBtn.addEventListener('click', () => {
    if (rounds > 0) {
        // reset the board and fleet
        playerOne.gameboard.resetBoard()
        playerTwo.gameboard.resetBoard()
        playerOne.gameboard.resetFleet()
        playerTwo.gameboard.resetFleet()
        // reset HTML
        while (boardOne.hasChildNodes()) {
            boardOne.removeChild(boardOne.firstChild)
        }
        while (boardTwo.hasChildNodes()) {
            boardTwo.removeChild(boardTwo.firstChild)
        }
        
        disableBoard(boardOne, true)
        disableBoard(boardTwo, true)
    }

    playerOne.placeRandomFleet()
    playerTwo.placeRandomFleet()

    renderBoard(playerOne, boardOne)
    renderBoard(playerTwo, boardTwo)

    playBtn.style.visibility = 'hidden'
    disableBoard(boardTwo, false)  // player starts
    
    rounds++
})

// add listeners to each board to play in turns
boardOne.addEventListener('click', () => {
    disableBoard(boardOne, true)
    disableBoard(boardTwo, false)

    // end game
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