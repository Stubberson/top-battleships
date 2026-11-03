import './style.css'
import { Player } from "./player.js"
import { getRandomInt, renderBoard, disableBoard } from './renderer.js'

const quickPlayBtn = document.querySelector('.quick')
const slowPlayBtn = document.querySelector('.slow')
const rulesBtn = document.querySelector('.rules')

const endDialog = document.querySelector('#game-end-dialog')
const dialogText = document.querySelector('#game-end-dialog span')
const endDialogBtn = document.querySelector('#game-end-dialog button')

const boardOne = document.querySelector('.own-board')
const boardTwo = document.querySelector('.opponent-board')

// create players
const playerOne = new Player()
const playerTwo = new Player('computer')

renderBoard(playerOne, boardOne)
renderBoard(playerTwo, boardTwo)
disableBoard(boardOne, true)
disableBoard(boardTwo, true)

// play game with random ship placements
quickPlayBtn.addEventListener('click', () => {
    startGame(true)
})

// player places their own fleet
slowPlayBtn.addEventListener('click', () => {
    startGame()
})

endDialogBtn.addEventListener('click', () => {
    endDialog.close()
})

let rounds = 0
function startGame(quick = false) {
    if (rounds > 0) {
        // reset the board and fleet
        playerOne.gameboard.resetBoard()
        playerTwo.gameboard.resetBoard()
        playerOne.gameboard.resetFleet()
        playerTwo.gameboard.resetFleet()
        
        disableBoard(boardOne, true)
        disableBoard(boardTwo, true)
    }

    if (quick) {
        playerOne.placeRandomFleet()
    } else {
        // playerOne.placeOwnFleet()
    }
    playerTwo.placeRandomFleet()

    renderBoard(playerOne, boardOne)
    renderBoard(playerTwo, boardTwo)

    quickPlayBtn.style['visibility'] = 'hidden'
    slowPlayBtn.style['visibility'] = 'hidden'
    rulesBtn.style['visibility'] = 'hidden'
    disableBoard(boardTwo, false)  // player starts
    
    rounds++
}

function changeTurn(player, board) {
    if (board.classList.contains('own-board')) {
        disableBoard(boardOne, true)
        disableBoard(boardTwo, false)

        if (player.gameboard.fleetIsSunk()) {
            disableBoard(boardTwo, true)
            
            dialogText.innerHTML = 'The computer got the best of you... Better luck next time!'
            endDialog.showModal()
            
            quickPlayBtn.innerText = 'Play again!'
            quickPlayBtn.style['visibility'] = 'visible'
            slowPlayBtn.style['visibility'] = 'visible'
            rulesBtn.style['visibility'] = 'visible'
        }
    } else {
        disableBoard(boardTwo, true)
        disableBoard(boardOne, false)

        if (player.gameboard.fleetIsSunk()) {
            disableBoard(boardOne, true)
            
            dialogText.innerHTML = 'You sunk the opponents fleet, well done!'
            endDialog.showModal()

            quickPlayBtn.innerText = 'Play again!'
            quickPlayBtn.style['visibility'] = 'visible'
            slowPlayBtn.style['visibility'] = 'visible'
            rulesBtn.style['visibility'] = 'visible'
        } else {
            setTimeout(() => {
                player.computerAttack(playerOne, boardOne)
            // emulate "thinking" by randomizing the time to click
            }, getRandomInt(1000) + 1250)  
        }
    }
}

export { changeTurn }