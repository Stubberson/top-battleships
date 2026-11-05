import { changeTurn } from './index.js'

const playerFleet = document.querySelector('.player-fleet')
const opponentFleet = document.querySelector('.opponent-fleet')
const playerFleetViz = document.querySelectorAll('.player-fleet .ship-viz')
const opponentFleetViz = document.querySelectorAll('.opponent-fleet .ship-viz')

// general helper function
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// create HTML representation of the board
function renderBoard(player, playerBoard) {
    // reset board visuals when replay
    resetViz(playerBoard)
    
    // flag for preventing clicks on the board while animating
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
            cellElem.addEventListener('click', async () => {
                if (busy) return  // return if animation underway
                
                try {
                    player.gameboard.receiveAttack([col, row])
                } catch (error) {
                    cellElem.classList.add('jitter')  // inform player of invalid attack
                    return
                }

                // wait until the board is visually updated, then change turn
                busy = true
                await updateBoard(player, playerBoard, col, row)
                changeTurn(player, playerBoard)
                busy = false
            })

            // remove class once the animation finishes so it can retrigger
            cellElem.addEventListener('animationend', () => {
                cellElem.classList.remove('jitter')
            })
            
            rowElem.appendChild(cellElem)
        }
        playerBoard.appendChild(rowElem)
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
    // whose ships need to be updated?
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

function resetViz(board) {
    // reset play board
    while (board.hasChildNodes()) {
        board.removeChild(board.firstChild)
    }

    // reset fleet infos
    const infos = [...playerFleetViz, ...opponentFleetViz]
    infos.forEach(viz => {
        // viz.children are the square divs representing a ship
        for (let i = 0; i < viz.children.length; i++) {
            viz.children[i].style['background-color'] = ''
            viz.children[i].style['box-shadow'] = 'revert'
        }
    })

    // reset the infos after commandeering
    playerFleetViz.forEach(div => {
        if (div.classList.contains('ship-placement')) {
            div.classList.remove('ship-placement')
            div.classList.add('ship-viz')
            div.draggable = 'false'
        }
    })
    opponentFleet.style['display'] = 'flex'
    opponentFleet.style['translate'] = '0px'
}

// visually prompts drag'n'drop for fleet
function prepareFleetPlacement() {
    opponentFleet.style['translate'] = '-200px'
    playerFleetViz.forEach(div => {
        div.classList.remove('ship-viz')
        div.classList.add('ship-placement')
    })
    opponentFleet.style['display'] = 'none'
}


export { getRandomInt, renderBoard, disableBoard, prepareFleetPlacement }