const { Ship } = require('./ship.js')

class Board {
    constructor() {
        this.board = this.#createBoard()
        // One Cruiser, two Battleships, etc.
        this.ships = {5: 1, 4: 2, 3: 3, 3: 4, 2: 5}
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
        const ship = new Ship(shipSize)
        if (this.ships[ship.size] > 0) this.ships[ship.size]--
        
        // Make the input coordinates order agnostic
        if (coords2.some(c => c < coords1[0] || c < coords1[1])) {
            let temp = coords1
            coords1 = coords2
            coords2 = temp
        }

        for (let row = coords1[0]; row <= coords2[0]; row++) {
            for (let col = coords1[1]; col <= coords2[1]; col++) {
                this.board[col][row] = 2
            }
        }
        return this.board
    }

    receiveAttack(coords) {

    }

}

module.exports = { Board }