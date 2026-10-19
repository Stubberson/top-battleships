// Create HTML representation of the board
function renderBoard(player, playerBoard) {
    // Refresh the board first
    while (playerBoard.hasChildNodes()) {
        playerBoard.removeChild(playerBoard.firstChild)
    }

    for (let row = 0; row < player.gameboard.board.length; row++) {
        let rowElem = document.createElement('div')
        rowElem.className = 'board-row'

        for (let col = 0; col < player.gameboard.board[row].length; col++) {
            let cellElem = document.createElement('div')
            switch (player.gameboard.board[row][col]) {
                case 2:
                    cellElem.className = 'ship'
                    break
                case 1:
                    cellElem.classList.add('hit')
                    break
                case 0:
                    cellElem.className = 'empty'
                    break
                case -1:
                    cellElem.className = 'miss'
                    break
            }

            // Each cell listens for an attack and refreshes board
            cellElem.addEventListener('click', () => {
                player.gameboard.receiveAttack([col, row])
                renderBoard(player, playerBoard)
            })
            
            rowElem.appendChild(cellElem)
        }
        playerBoard.appendChild(rowElem)
    }
}

// Clarify whose turn it is
function disableBoard(board, disable) {
    if (disable) {
        board.style['opacity'] = 0.3
        board.style['pointer-events'] = 'none'
    } else {
        board.style['opacity'] = 1
        board.style['pointer-events'] = 'auto'
    }
}

export { renderBoard, disableBoard }