const { Ship } = require('./ship.js')

class Board {
    constructor() {
        this.board = this.#createBoard()
        this.fleet = { 'carrier': undefined,
                       'battleship': undefined,
                       'cruiser': undefined,
                       'submarine': undefined,
                       'destroyer': undefined }
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

    placeShip(type, coords1, coords2) {
        const ship = new Ship(type)

        // Make input coordinates order agnostic
        if (coords2[0] < coords1[0] || coords2[1] < coords1[1]) {
            let temp = coords1
            coords1 = coords2
            coords2 = temp
        }

        // Make sure given coordinates correspond with ship size
        let coordLength = 1
        coords1[0] === coords2[0]
            ? coordLength += coords2[1] - coords1[1]
            : coordLength += coords2[0] - coords1[0]

        if (ship.size !== coordLength) {
            throw Error('Given coordinates do not match given ship size')
        }

        // 2 = ship on coord, 1 = hit ship on coord, 0 = no ship or miss on coord, -1 = miss on coord
        // Retrieve coordinates for proposed placement (expect coords as (X, Y))
        let coordinates = []
        for (let row = coords1[0]; row <= coords2[0]; row++) {
            for (let col = coords1[1]; col <= coords2[1]; col++) {
                coordinates.push([col, row])
            }
        }

        //  Make sure that another ship is not placed on the proposed coordinates
        if (coordinates.some(pair => this.board[pair[0]][pair[1]] !== 0)) {
            throw Error('Cannot place a ship here')
        } else {
            // Place ship if available in fleet
            if (!this.fleet[ship.type]) {
                this.fleet[ship.type] = {'shipInstance': ship, 'coords': coordinates}
                coordinates.forEach(pair => this.board[pair[0]][pair[1]] = 2)
            } else {
                throw Error('Ship already placed')
            }
        }
    }

    receiveAttack(coords) {
        if (this.board[coords[1]][coords[0]] === 2 || this.board[coords[1]][coords[0]] === 0) {
            // Record attack on board
            this.board[coords[1]][coords[0]]--

            // Record attack on a particular ship
            for (let ship of Object.values(this.fleet)) {
                if (ship && ship['coords'].toString().includes(coords.toString())) {
                    ship['shipInstance'].hit()
                }
            }
        }
    }

}

module.exports = { Board }