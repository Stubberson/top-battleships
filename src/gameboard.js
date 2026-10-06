class Board {
    constructor() {
        this.board = this.#createBoard()
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

    placeShipAt(shipType, startCoord, endCoord) {


    }

}

module.exports = { Board }