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
        // Coordinates are expected as [X, Y] starting from upper left corner of board
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
        // Retrieve coordinates for proposed placement
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
            if (this.fleet[ship.type]) {
                throw Error('Ship already placed')
            } else {
                this.fleet[ship.type] = {'shipInstance': ship, 'coords': coordinates}
                coordinates.forEach(pair => this.board[pair[0]][pair[1]] = 2)
            }
        }
    }

    receiveAttack(coords) {
        if (this.board[coords[1]][coords[0]] === 1 || this.board[coords[1]][coords[0]] === -1) {
            throw new Error('This square has already been attacked')
        } else {
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

    fleetIsSunk() {
        if (Object.values(this.fleet).some(ship => !ship || !ship['shipInstance'].isSunk())) {
            return false
        } else {
            return true
        }
    }

}

module.exports = { Board }