const { Board } = require('../src/gameboard.js')

const newBoard = new Board()

test('should place ship correctly on empty board', () => {
    newBoard.placeShip('carrier', [1, 1], [5, 1])
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

    expect(newBoard.board).toMatchObject(carrierPlaced)    
})

test('should keep track of placed ships', () => {
    newBoard.placeShip('cruiser', [7, 7], [7, 9])
    newBoard.placeShip('submarine', [0, 3], [2, 3])
    newBoard.placeShip('destroyer', [9, 9], [8, 9])
    
    expect(newBoard.fleet['carrier']).toBeTruthy()
    expect(newBoard.fleet['cruiser']).toBeTruthy()
    expect(newBoard.fleet['destroyer']).toBeTruthy()
    expect(newBoard.fleet['battleship']).toBeFalsy()
})

test('should throw an error if given ship and coordinates do not match', () => {
    expect(() => newBoard.placeShip('destroyer', [0, 0], [2, 0])).toThrow(Error)
})

test('should throw an error if placing a ship on top of another', () => {
    expect(() => newBoard.placeShip('battleship', [4, 1], [1, 1])).toThrow(Error)
})

test('should throw an error if placing extra ships', () => {
    expect(() => newBoard.placeShip('carrier', [0, 0], [4, 0])).toThrow(Error)
    expect(() => newBoard.placeShip('submarine', [9, 0], [9, 2])).toThrow(Error)
})

test('should record a missed attack on board', () => {
    const currentBoard = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, -1],
        [0, 2, 2, 2, 2, 2, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 2, 2, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 2, 2, 2]
    ]
    
    newBoard.receiveAttack([9, 0])
    expect(newBoard.board).toMatchObject(currentBoard)
})

test('should record a hit on the right boat', () => {
    newBoard.receiveAttack([1, 1])
    newBoard.receiveAttack([9, 9])
    expect(newBoard.fleet['carrier']['shipInstance'].hits).toBe(1)
    expect(newBoard.fleet['destroyer']['shipInstance'].hits).toBe(1)
})

test('should prevent attacking the same square twice', () => {
    expect(() => newBoard.receiveAttack([1, 1])).toThrow(Error)
    expect(() => newBoard.receiveAttack([9, 9])).toThrow(Error)
})

test('should correctly report whether the fleet is sunk or not', () => {
    expect(newBoard.fleetIsSunk()).toBeFalsy()

    // Place battleship and destroy it
    newBoard.placeShip('battleship', [0,0], [3,0])
    for (let i = 0; i < 4; i++) {
        newBoard.receiveAttack([i, 0])
    }

    // Destroy carrier
    for (let i = 2; i < 6; i++) {
        newBoard.receiveAttack([i, 1])
    }

    // Destroy submarine
    for (let i = 0; i < 3; i++) {
        newBoard.receiveAttack([i, 3])
    }
    
    // Destroy cruiser
    for (let i = 7; i < 10; i++) {
        newBoard.receiveAttack([7, i])
    }

    // Destroy destroyer
    newBoard.receiveAttack([8, 9])

    expect(newBoard.fleetIsSunk()).toBeTruthy()
})