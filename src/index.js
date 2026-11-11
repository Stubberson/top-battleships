import './style.css'
import { Player } from "./player.js"
import { getRandomInt, renderBoard, disableBoard, resetViz } from './renderer.js'

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
        resetViz(boardOne)
        resetViz(boardTwo)
    }

    if (quickPlay) {
        playerOne.placeRandomFleet()
        playerTwo.placeRandomFleet()
        
        renderBoard(playerOne, boardOne)
        renderBoard(playerTwo, boardTwo)
        
        disableBoard(boardTwo, false)  // player starts
        disableBoard(boardOne, true)
    } else {
        // placeOwnFleet returns a Promise
        renderBoard(playerOne, boardOne)
        renderBoard(playerTwo, boardTwo)
        // TODO never returns the promise atm
        playerOne.placeOwnFleet().then(() => {
            playerTwo.placeRandomFleet()

            renderBoard(playerTwo, boardTwo)

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
        }
    } else {
        disableBoard(boardTwo, true)
        disableBoard(boardOne, false)

        if (player.gameboard.fleetIsSunk()) {
            disableBoard(boardOne, true)
            
            dialogText.innerHTML = 'You sunk the opponents fleet, well done!'
            endDialog.showModal()

            quickPlayBtn.innerText = 'Play again!'
        } else {
            setTimeout(() => {
                player.computerAttack(playerOne, boardOne)
            // emulate "thinking" by randomizing the time to click
            }, getRandomInt(1000) + 1250)  
        }
    }
}

// 'Drag and Drop' API is not modifiable enough, so dragging is 'manual'
function shipDrag() {
    return new Promise(resolve => {
        disableBoard(boardOne, false)
        let dragElements = document.querySelectorAll('.ship-placement')
        let ghost, rotation, dropTarget = 0
        let coordinates = []

        function move(event) {
            // ghost drag element
            const ghostHTML = event.currentTarget
            const rect = ghostHTML.getBoundingClientRect()
            const midX = rect.width / 2
            const midY = rect.height / 2

            // visible drag element, helps to get the proper drop target
            const leftBound = ghostHTML.firstChild.nextElementSibling.getBoundingClientRect().left
            const rightBound = ghostHTML.lastChild.previousElementSibling.getBoundingClientRect().right
            const elementMid = (rightBound - leftBound) / 2
            const calibrationVar = 5 * ghostHTML.children.length  // bc the dragged elem is visually modified after 'pointerdown', a little nudge is nice
            
            // grab and rotate at the center
            ghost.style['transform-origin'] = `${event.clientX + midX}px ${event.clientY + midY}px`
            ghost.style['transform'] = `translate(${event.clientX}px, ${event.clientY}px)`
            
            rotation % 180 === 0
                // horizontal placement
                ? dropTarget = document.elementFromPoint(event.clientX - (elementMid + calibrationVar), event.clientY)
                // vertical placement
                : dropTarget = document.elementFromPoint(event.clientX, event.clientY - (elementMid + calibrationVar))

            if (dropTarget && dropTarget.classList.contains('empty-square')) {
                switch (ghostHTML.classList[0]) {
                    case 'carrier':
                        coordinates = indicatePlacement(dropTarget, rotation, 5)
                        break
                    case 'battleship':
                        coordinates = indicatePlacement(dropTarget, rotation, 4)
                        break
                    case 'cruiser':
                        coordinates = indicatePlacement(dropTarget, rotation, 3)
                        break
                    case 'submarine':
                        coordinates = indicatePlacement(dropTarget, rotation, 3)
                        break
                    case 'destroyer':
                        coordinates = indicatePlacement(dropTarget, rotation, 2)
                        break
                }
            // player changes their mind and doesn't want to place chosen ship
            } else {
                dropTarget = undefined
            }
        }

        // add listeners to each element
        dragElements.forEach(element => {
            element.addEventListener('pointerdown', event => {
                // keeps one element selected
                element.setPointerCapture(event.pointerId)

                // draggable ghost element to not disturb actual element
                ghost = element.cloneNode(true)
                ghost.id = 'dragging'
                document.body.appendChild(ghost)
                rotation = 0

                move(event)
            })

            element.addEventListener('pointermove', event => {
                if (ghost) move(event)
            })

            element.addEventListener('pointerup', () => {
                if (!ghost) return
                if (!dropTarget) {
                    ghost.remove()
                    ghost = null
                    return
                }

                // place the ship on the board
                playerOne.gameboard.placeShip(ghost.classList[0], coordinates[0], coordinates[coordinates.length - 1])
                renderBoard(playerOne, boardOne)
                disableFleetImage(ghost.classList[0])
                
                ghost.remove()
                ghost = null
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

function indicatePlacement(dropTarget, rotation, shipSize) {
    const rowElement = dropTarget.parentElement
    
    // dropTarget's coordinates on the board
    const xIndex = [...rowElement.children].indexOf(dropTarget)
    const yIndex = [...boardOne.children].indexOf(rowElement)

    // first reset the previous indicators
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (boardOne.children[y].children[x].classList.contains('placement-indicator')) {
                boardOne.children[y].children[x].classList.remove('placement-indicator')
            }
        }   
    }

    let allowedNodes = []
    let coordinates = []

    let node
    if (rotation % 180 === 0) {  // horizontal
        if (xIndex >= 0 && xIndex <= 9 - (shipSize - 1)) {
            let i = 0
            while (allowedNodes.length < shipSize) {
                node = boardOne.children[yIndex].children[xIndex + i]
                allowedNodes.push(node)
                coordinates.push([xIndex + i, yIndex])
                i++
            }
        }
    } else {  // vertical
        if (yIndex >= 0 && yIndex <= 9 - (shipSize - 1)) {
            let i = 0
            while (allowedNodes.length < shipSize) {
                node = boardOne.children[yIndex + i].children[xIndex]
                allowedNodes.push(node)
                coordinates.push([xIndex, yIndex + i])
                i++
            }
        }
    }

    // set visual placement indicator
    allowedNodes.forEach(node => {
        if (!node.classList.contains('placement-indicator')) {
            node.classList.add('placement-indicator')
        }
    })

    // return coordinates to be able to actually place the ship on 'pointerup'
    return coordinates
}

function disableFleetImage(type) {
    const playerFleetViz = document.querySelectorAll('.player-fleet .ship-placement')
    playerFleetViz.forEach(div => {
        if (div.classList.contains(type)){
            div.classList.add('ship-placed')
            div.classList.remove('ship-placement')
        }
    })
}

export { changeTurn, shipDrag }