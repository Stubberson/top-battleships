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
function startGame(quickPlay = false) {
    if (rounds > 0) {
        // reset the board and fleet
        playerOne.gameboard.resetBoard()
        playerTwo.gameboard.resetBoard()
        playerOne.gameboard.resetFleet()
        playerTwo.gameboard.resetFleet()
        
        disableBoard(boardOne, true)
        disableBoard(boardTwo, true)
    }

    if (quickPlay) {
        playerOne.placeRandomFleet()
        playerTwo.placeRandomFleet()
        
        renderBoard(playerOne, boardOne)
        renderBoard(playerTwo, boardTwo)
        
        quickPlayBtn.style['visibility'] = 'hidden'
        slowPlayBtn.style['visibility'] = 'hidden'
        rulesBtn.style['visibility'] = 'hidden'
        disableBoard(boardTwo, false)  // player starts

        
    } else {
        // placeOwnFleet returns a Promise
        playerOne.placeOwnFleet().then(() => {
            playerTwo.placeRandomFleet()

            quickPlayBtn.style['visibility'] = 'hidden'
            slowPlayBtn.style['visibility'] = 'hidden'
            rulesBtn.style['visibility'] = 'hidden'
            disableBoard(boardTwo, false)
        })
    }
    
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

// 'Drag and Drop' API is not modifiable enough, so dragging is manual
function shipDrag() {
    return new Promise(resolve => {
        disableBoard(boardOne, false)
        const dragElements = document.querySelectorAll('.ship-placement')
        let ghost, rotation = 0

        function move(event) {
            const rect = event.target.getBoundingClientRect()
            const midX = rect.width / 2
            const midY = rect.height / 2

            // grab and rotate at the center
            ghost.style['transform-origin'] = `${event.clientX + midX}px ${event.clientY + midY}px`
            ghost.style['transform'] = `translate(${event.clientX}px, ${event.clientY}px)`   
        }

        // add listeners to each element
        dragElements.forEach(element => {
            element.addEventListener('pointerdown', event => {
                // keeps one element selected
                element.setPointerCapture(event.pointerId)

                // draggable ghost element to be able to transform without touching og
                ghost = element.cloneNode(true)
                ghost.id = 'dragging'  // id for styling
                document.body.appendChild(ghost)
                rotation = 0
                move(event)
            })

            element.addEventListener('pointermove', event => {
                if (ghost) move(event)
            })

            element.addEventListener('pointerup', event => {
                if (!ghost) return
                ghost.remove()
                ghost = null

                // hit-test manually, since there are no native drop events
                const target = document.elementFromPoint(event.clientX, event.clientY)
                const orientation = ((rotation % 360) + 360) % 360   // 0, 90, 180 or 270
                console.log('dropped on', target, 'rotated', orientation)
            })

            element.addEventListener('pointercancel', () => {
                ghost?.remove()
                ghost = null
            })
        })

        document.addEventListener('keydown', event => {
            if (!ghost) return
            if (event.key === 'R' || event.key === 'r') {
                rotation += 90
                ghost.style.rotate = `${rotation}deg`
            }
        })
    })
}

export { changeTurn, shipDrag }