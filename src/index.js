import './style.css'
import { Player } from './player.js'

const quickPlayBtn = document.querySelector('.quick')
const slowPlayBtn = document.querySelector('.slow')

const endDialog = document.querySelector('#game-end-dialog')
const dialogText = document.querySelector('#game-end-dialog span')
const endDialogBtn = document.querySelector('#game-end-dialog button')

const boardOne = document.querySelector('.own-board')
const boardTwo = document.querySelector('.opponent-board')

const opponentFleet = document.querySelector('.opponent-fleet')
const playerFleetViz = document.querySelectorAll('.player-fleet .ship-viz')
const opponentFleetViz = document.querySelectorAll('.opponent-fleet .ship-viz')

// general helper function
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// -----------------------
// GAME LOGIC
// -----------------------

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
    console.log(rounds)
    if (rounds > 0) {
        // reset the board and fleet
        playerOne.gameboard.resetBoard()
        playerTwo.gameboard.resetBoard()
        playerOne.gameboard.resetFleet()
        playerTwo.gameboard.resetFleet()
        resetBoard(boardOne)
        resetBoard(boardTwo)
        resetFleetInfo()
    }

    if (quickPlay) {
        playerOne.placeRandomFleet()
        playerTwo.placeRandomFleet()
        
        renderBoard(playerOne, boardOne)
        renderBoard(playerTwo, boardTwo)
        
        disableBoard(boardTwo, false)  // player starts
        disableBoard(boardOne, true)
    } else {
        renderBoard(playerOne, boardOne)
        renderBoard(playerTwo, boardTwo)

        
        prepareFleetPlacement()
        
        // when ship dragging is done, render boards and start game
        shipDrag().then(() => {
            resetFleetInfo()
            
            playerTwo.placeRandomFleet()

            renderBoard(playerTwo, boardTwo)

            disableBoard(boardOne, true)
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
        }
    } else {
        disableBoard(boardTwo, true)
        disableBoard(boardOne, false)

        if (player.gameboard.fleetIsSunk()) {
            disableBoard(boardOne, true)
            
            dialogText.innerHTML = "You sunk the clanker's fleet, well done!"
            endDialog.showModal()
        } else {
            setTimeout(() => {
                player.computerAttack(playerOne, boardOne)
            // emulate "thinking" by randomizing the time to click
            }, getRandomInt(1000) + 1250)  
        }
    }
}

// -----------------------------
// HTML RENDERING
// -----------------------------

// create HTML representation of the board
function renderBoard(player, board) {
    resetBoard(board)

    // 'flag' to prevent clicks on the board while animating
    let busy = false

    for (let row = 0; row < player.gameboard.board.length; row++) {
        let rowElem = document.createElement('div')
        rowElem.className = 'board-row'

        for (let col = 0; col < player.gameboard.board[row].length; col++) {
            let cellElem = document.createElement('div')
            switch (player.gameboard.board[row][col]) {
                case 2:
                    cellElem.className = 'ship'
                    break
                case 0:
                    cellElem.className = 'empty-square'
                    break
            }

            // each cell is async to be able to wait for visual board update
            cellElem.addEventListener('click', async (event) => {
                if (busy) return  // return if animation underway
                
                try {
                    // deny clicks on own board by player
                    if (event.isTrusted && event.target.parentElement.parentElement.classList.contains('own-board')) {
                        throw new Error('Player cannot click their own board')
                    }
                    player.gameboard.receiveAttack([col, row])
                } catch (error) {
                    cellElem.classList.add('jitter')  // inform player of unallowed click
                    return
                }

                // wait until the board is visually updated, then change turn
                busy = true
                await updateBoard(player, board, col, row)
                changeTurn(player, board)
                busy = false
            })

            // remove class once the animation finishes so it can retrigger
            cellElem.addEventListener('animationend', () => {
                cellElem.classList.remove('jitter')
            })
            
            rowElem.appendChild(cellElem)
        }
        board.appendChild(rowElem)
    }
}

// helps to visually "roll out" a ship destruction
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// async to be able to wait for complete visual update before turn change
async function updateBoard(player, board, x, y) {
    // the first collection of children gives the row (i.e. y-coordinate)
    const cell = board.children[y].children[x]

    switch (cell.className) {
        case 'ship':
            cell.classList.add('hit')
            break
        case 'empty-square':
            cell.classList.add('miss')
            break
    }
    
    let animations = []
    // add 'sunk' class name if ship is sunk
    Object.values(player.gameboard.fleet).forEach(obj => {
        let ship = obj['shipInstance']
        if (ship.isSunk()) {
            obj['coords'].forEach((pair, i, arr) => {
                let elem = board.children[pair[1]].children[pair[0]]

                // don't reanimate already animated squares
                if (elem.classList.contains('sunk')) return
                
                elem.classList.add('sunk')
                animations.push(
                    sleep(i * 250).then(() => setShipStyle(elem, pair, i, arr))
                )
            })
            
            updateFleetInfo(player, ship)  // simultaneously update fleet info
        }
    })

    // wait for the whole animation to resolve
    await Promise.all(animations)
}

// update fleet side panel
function updateFleetInfo(player, ship) {
    let fleetInfo
    player.name === 'computer' ? fleetInfo = opponentFleetViz : fleetInfo = playerFleetViz
    
    fleetInfo.forEach(wrapper => {
        if (wrapper.classList.contains(ship.type)) {  // make sure to update the right ship
            for (let i = 0; i < wrapper.children.length; i++) {
                // don't re-color
                if (wrapper.children[i].style['background-color'] === 'grey') return

                sleep(i * 250).then(() => {
                    wrapper.children[i].style['background-color'] = 'grey'
                    wrapper.children[i].style['box-shadow'] = 'inset black 2px 2px'
                })
            }
        }
    })
}

function setShipStyle(elem, pair, i, arr) {
    // 'sunken-ship' effect is achieved by manipulating padding of background-color
    elem.style['background-color'] = 'black'
    if (i === 0) {  // ship front
        if (pair[0] > arr[1][0]) {
            elem.style['padding'] = '20% 30% 20% 0'
        } else if (pair[0] < arr[1][0]) {
            elem.style['padding'] = '20% 0 20% 30%'
        } else if (pair[1] > arr[1][1]) {
            elem.style['padding'] = '0 20% 30% 20%'
        } else {
            elem.style['padding'] = '30% 20% 0 20%'
        }
    } else if (i === arr.length - 1) {  // ship rear
        if (pair[0] > arr[0][0]) {
            elem.style['padding'] = '20% 30% 20% 0'
        } else if (pair[0] < arr[0][0]) {
            elem.style['padding'] = '20% 0 20% 30%'
        } else if (pair[1] > arr[0][1]) {
            elem.style['padding'] = '0 20% 30% 20%'
        } else {
            elem.style['padding'] = '30% 20% 0 20%'
        }
    } else {
        if (pair[0] !== arr[0][0]) {
            elem.style['padding'] = '20% 0'
        } else {
            elem.style['padding'] = '0 20%'
        }
    }
}

// clarify whose turn it is
function disableBoard(board, disable) {
    if (disable) {
        board.style['opacity'] = 0.3
        board.style['pointer-events'] = 'none'
    } else {
        board.style['opacity'] = 1
        board.style['pointer-events'] = 'auto'
    }
}

function resetBoard(board) {
    while (board.hasChildNodes()) {
        board.removeChild(board.firstChild)
    }
}

function resetFleetInfo() {
    const infos = [...playerFleetViz, ...opponentFleetViz]
    infos.forEach(viz => {
        // reset styles after commandeering
        if (viz.classList.contains('ship-placed') || viz.classList.contains('ship-placement')) {
            viz.classList.remove('ship-placed')
            viz.classList.remove('ship-placement')
            viz.classList.add('ship-viz')
            const deployedText = viz.querySelector('span')
            deployedText?.remove()
        }

        // viz.children are the square divs representing a ship
        for (let i = 0; i < viz.children.length; i++) {
            viz.children[i].style['background-color'] = ''
            viz.children[i].style['box-shadow'] = 'none'
        }
    })

    opponentFleet.style['display'] = 'flex'
    opponentFleet.style['translate'] = '0px'
}

// visually prompts drag'n'drop for fleet
function prepareFleetPlacement() {
    opponentFleet.style['translate'] = '-200px'
    playerFleetViz.forEach(div => {
        if (div.classList.contains('ship-viz')) {
            div.classList.remove('ship-viz')
        }

        div.classList.add('ship-placement')
    })
    opponentFleet.style['display'] = 'none'
}

function disableShipImage(type) {
    const playerFleetViz = document.querySelectorAll('.player-fleet .ship-placement')
    playerFleetViz.forEach(div => {
        if (div.classList.contains(type)){
            div.classList.add('ship-placed')
            div.classList.remove('ship-placement')
            const deployedText = document.createElement('span')
            deployedText.innerHTML = `${type} deployed`
            div.appendChild(deployedText)
        }
    })
}

// -----------------------
// SHIP DRAGGING
// -----------------------
// 'Drag and Drop' API is not modifiable enough, so dragging is 'manual'
function shipDrag() {
    // resolves only after every ship is correctly placed
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

            // indicate possible ship placement on hover
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

        // add listeners to each ship
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
                    resetIndicators()
                    ghost.remove()
                    ghost = null
                    return
                }

                // place the ship on the board
                if (coordinates) {
                    const shipType = ghost.classList[0]
                    playerOne.gameboard.placeShip(shipType, coordinates[0], coordinates[coordinates.length - 1])
                    renderBoard(playerOne, boardOne)
                    disableShipImage(ghost.classList[0])
                } else {
                    resetIndicators()
                }
                
                ghost.remove()
                ghost = null

                // on every 'pointerup' check if all ships are placed, if so, resolve the promise
                if (Object.values(playerOne.gameboard.fleet).some(ship => ship === undefined)) {
                    return
                } else {
                    resolve()
                }
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

// indicate possible ship placement
function indicatePlacement(dropTarget, rotation, shipSize) {
    const rowElement = dropTarget.parentElement
    
    // dropTarget's coordinates on the board
    const xIndex = [...rowElement.children].indexOf(dropTarget)
    const yIndex = [...boardOne.children].indexOf(rowElement)

    resetIndicators()

    let allowedNodes = []
    let coordinates = []

    // only indicate allowed placements
    let node
    if (rotation % 180 === 0) {  // horizontal
        if (xIndex >= 0 && xIndex <= 9 - (shipSize - 1)) {
            let i = 0
            while (allowedNodes.length < shipSize) {
                node = boardOne.children[yIndex].children[xIndex + i]
                // prevent placing ship on top of another
                if (node.classList.contains('ship')) {
                    allowedNodes = []
                    coordinates = []
                    return
                } else {
                    allowedNodes.push(node)
                    coordinates.push([xIndex + i, yIndex])
                    i++
                }
            }
        }
    } else {  // vertical
        if (yIndex >= 0 && yIndex <= 9 - (shipSize - 1)) {
            let i = 0
            while (allowedNodes.length < shipSize) {
                node = boardOne.children[yIndex + i].children[xIndex]
                if (node.classList.contains('ship')) {
                    allowedNodes = []
                    coordinates = []
                    return
                } else {
                    allowedNodes.push(node)
                    coordinates.push([xIndex, yIndex + i])
                    i++
                }
            }
        }
    }

    // set visual placement indicator
    allowedNodes?.forEach(node => {
        if (!node.classList.contains('placement-indicator')) {
            node.classList.add('placement-indicator')
        }
    })

    // return coordinates to be able to actually place the ship on 'pointerup'
    return coordinates
}

// reset previous indicators to highlight only the current drop indicators
function resetIndicators() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (boardOne.children[y].children[x].classList.contains('placement-indicator')) {
                boardOne.children[y].children[x].classList.remove('placement-indicator')
            }
        }   
    }
}


export { changeTurn, shipDrag, getRandomInt, renderBoard, disableBoard, resetBoard, resetFleetInfo, prepareFleetPlacement }