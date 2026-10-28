import './style.css'
import { Player } from "./player.js"
import { getRandomInt, renderBoard, disableBoard } from './renderer.js'

const quickPlayBtn = document.querySelector('.quick')
const slowPlayBtn = document.querySelector('.place-ships')
const boardOne = document.querySelector('.own-board')
const boardTwo = document.querySelector('.opponent-board')

// create players
const playerOne = new Player()
const playerTwo = new Player()

renderBoard(playerOne, boardOne)
renderBoard(playerTwo, boardTwo)
disableBoard(boardOne, true)
disableBoard(boardTwo, true)

// play game with random ship placements
quickPlayBtn.addEventListener('click', () => {
    startGame()
})

// player places their own fleet
slowPlayBtn.addEventListener('click', () => {
    startGame(true)
})

let rounds = 0
function startGame(slow = false) {
    if (rounds > 0) {
        // reset the board and fleet
        playerOne.gameboard.resetBoard()
        playerTwo.gameboard.resetBoard()
        playerOne.gameboard.resetFleet()
        playerTwo.gameboard.resetFleet()
        
        disableBoard(boardOne, true)
        disableBoard(boardTwo, true)
    }

    slow ? playerOne.placeOwnFleet() : playerOne.placeRandomFleet()
    playerTwo.placeRandomFleet()

    renderBoard(playerOne, boardOne)
    renderBoard(playerTwo, boardTwo)

    quickPlayBtn.style.visibility = 'hidden'
    slowPlayBtn.style.visibility = 'hidden'
    disableBoard(boardTwo, false)  // player starts
    
    rounds++
}

function changeTurn(player, board) {
    if (board.classList.contains('own-board')) {
        disableBoard(boardOne, true)
        disableBoard(boardTwo, false)

        if (player.gameboard.fleetIsSunk()) {
            disableBoard(boardTwo, true)
            // TODO
            console.log('Computer wins!')
            quickPlayBtn.innerText = 'Play again!'
            quickPlayBtn.style.visibility = 'visible'
            slowPlayBtn.style.visibility = 'visible'
        }
    } else {
        disableBoard(boardTwo, true)
        disableBoard(boardOne, false)

        if (player.gameboard.fleetIsSunk()) {
            disableBoard(boardOne, true)
            // TODO
            console.log('You win!')
            quickPlayBtn.innerText = 'Play again!'
            quickPlayBtn.style.visibility = 'visible'
            slowPlayBtn.style.visibility = 'visible'
        } else {
            setTimeout(() => {
                player.computerAttack(playerOne, boardOne)
            // emulate "thinking" by randomizing the time to click
            }, getRandomInt(1000) + 1500)  
        }
    }
}

export { changeTurn }