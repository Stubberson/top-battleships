const { Ship } = require('./ship.js')

class Board {
    constructor() {
        this.board = this.#createBoard()
        this.fleet = {5: 0, 4: 0, 3: 0, 2: 0}
    }

    #createBoard() {
        let board = []
        for (let i = 0; i < 10; i++) {
            let row = []
            for (let j = 0; j < 10; j++) {
                row.push(0)
            }
            board.push(row)
        }
        return board
    }

    placeShip(shipSize, coords1, coords2) {
        // Make input coordinates order agnostic
        if (coords2[0] < coords1[0] || coords2[1] < coords1[1]) {
            let temp = coords1
            coords1 = coords2
            coords2 = temp
        }

        // Make sure given coordinates correspond with shipSize
        let coordLength = 1
        coords1[0] === coords2[0]
            ? coordLength += coords2[1] - coords1[1]
            : coordLength += coords2[0] - coords1[0]

        if (shipSize !== coordLength) {
            throw Error('Given coordinates do not match given ship size')
        }

        // 2 = ship on coord, 1 = hit ship on coord, 0 = no ship or miss on coord, -1 = miss on coord
        // Retrieve coordinates for proposed placement (expect coords as (X, Y))
        let proposedPlacement = []
        for (let row = coords1[0]; row <= coords2[0]; row++) {
            for (let col = coords1[1]; col <= coords2[1]; col++) {
                proposedPlacement.push([col, row])
            }
        }

        //  Make sure that another ship is not placed on the proposed coordinates
        if (proposedPlacement.some(pair => this.board[pair[0]][pair[1]] !== 0)) {
            throw Error('Cannot place a ship here')
        } else {
            // Place ship if available in fleet
            if (this.fleet[shipSize] === 0 || (shipSize === 3 && this.fleet[shipSize] < 2)) {
                const ship = new Ship(shipSize)
                this.fleet[ship.size]++
                proposedPlacement.forEach(pair => this.board[pair[0]][pair[1]] = 2)
            } else {
                throw Error('Ship already placed')
            }
        }
    }

    receiveAttack(coords) {
        
    }

}

module.exports = { Board }