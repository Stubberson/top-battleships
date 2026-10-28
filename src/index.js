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


function playTurn(player, board) {
    if (board.classList.contains('own-board')) {
        disableBoard(boardOne, true)
        disableBoard(boardTwo, false)

        if (player.gameboard.fleetIsSunk()) {
            disableBoard(boardTwo, true)
            // TODO
            console.log('Computer wins!')
            playBtn.innerText = 'Play again!'
            playBtn.style.visibility = 'visible'
        }
    } else {
        disableBoard(boardTwo, true)
        disableBoard(boardOne, false)

        if (player.gameboard.fleetIsSunk()) {
            disableBoard(boardOne, true)
            // TODO
            console.log('You win!')
            playBtn.innerText = 'Play again!'
            playBtn.style.visibility = 'visible'
        } else {
            setTimeout(() => {
                player.computerAttack(playerOne, boardOne)
            }, 1000)
        }
    }
}

export { playTurn }