import { changeTurn } from './index.js'

const informant = document.querySelector('.informant')
const playerFleetInfo = document.querySelectorAll('.own-fleet')
const opponentFleetInfo = document.querySelectorAll('.opponent-fleet')

function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

// create HTML representation of the board
function renderBoard(player, playerBoard) {
    // refresh board if 'play again!'
    while (playerBoard.hasChildNodes()) {
        playerBoard.removeChild(playerBoard.firstChild)
    }

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
                if (busy) return
                
                try {
                    player.gameboard.receiveAttack([col, row])
                } catch (error) {
                    // inform player of invalid attack
                    cellElem.classList.add('jitter')
                    return
                }

                // wait until the board is visually updated, then change turn
                busy = true
                await updateBoard(player, playerBoard, col, row)
                // updateFleetInfo(player, playerBoard)
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

// helps in visually "roll out" a ship destruction, cannot be rejected
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// async to be able to wait for complete visual update
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
        if (obj['shipInstance'].isSunk()) {
            obj['coords'].forEach((pair, i, arr) => {
                let elem = board.children[pair[1]].children[pair[0]]

                // don't reanimate already animated squares
                if (elem.classList.contains('sunk')) return
                
                elem.classList.add('sunk')
                animations.push(
                    sleep(i * 250).then(() => setShipStyle(elem, pair, i, arr))
                )
            })
        }
    })

    // wait for the whole animation to resolve
    await Promise.all(animations)
}

function setShipStyle(elem, pair, i, arr) {
    // the 'sunken-ship' effect is achieved by manipulating the padding of background-color
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

// TODO
// function updateFleetInfo(player, board) {
//     // add 'hit' class name if ship is hit
//     Object.values(player.gameboard.fleet).forEach(obj => {
//         if (obj['shipInstance'].isSunk()) {
//             obj['coords'].forEach((pair, i, arr) => {
//                 let elem = board.children[pair[1]].children[pair[0]]
//                 elem.classList.add('hit')
//                 // "roll out" the ship destruction
//                 setTimeout(() => {
//                     setShipStyle(elem, pair, i, arr)
//                 }, i * 250)
//             })
//         }
//     })
// }

export { getRandomInt, renderBoard, disableBoard }