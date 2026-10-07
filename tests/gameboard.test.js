const { Board } = require('../src/gameboard.js')

const newBoard = new Board()

test('should place ship correctly on empty board', () => {
    const carrierPlaced = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]

    newBoard.placeShip(5, [1, 1], [5, 1])
    expect(newBoard.board).toMatchObject(carrierPlaced)    
})

test('should keep track of placed ships', () => {
    newBoard.placeShip(3, [7, 7], [7, 9])
    newBoard.placeShip(3, [0, 3], [2, 3])
    newBoard.placeShip(2, [9, 9], [8, 9])
    
    expect(newBoard.ships[5]).toBe(1)
    expect(newBoard.ships[3]).toBe(2)
    expect(newBoard.ships[2]).toBe(1)
})

test('should throw an error if given ship and coordinates do not match', () => {
    expect(() => newBoard.placeShip(2, [0, 0], [2, 0])).toThrow(Error)
})

test('should throw an error if placing a ship on top of another', () => {
    expect(() => newBoard.placeShip(4, [4, 1], [1, 1])).toThrow(Error)
    expect(() => newBoard.placeShip(3, [2, 0], [2, 2])).toThrow(Error)
})

test('should throw an error if placing extra ships', () => {
    expect(() => newBoard.placeShip(5, [0, 0], [4, 0])).toThrow(Error)
    expect(() => newBoard.placeShip(3, [9, 0], [9, 2])).toThrow(Error)
})
