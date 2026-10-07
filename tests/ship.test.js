const { Ship } = require('../src/ship.js')

const battleship = new Ship('battleship')
const cruiser = new Ship('cruiser')

test('should create a new ship instance with correct size', () => {
    expect(battleship.size).toBe(4)
    expect(cruiser.size).toBe(3)
})

test('should take a hit', () => {
    battleship.hit()
    battleship.hit()
    expect(battleship.hits).toBe(2)
    expect(cruiser.hits).toBe(0)
})

test('should sink with enough hits', () => {
    for (let hit = 0; hit < 2; hit++) {
        battleship.hit()
        cruiser.hit()
    }

    expect(battleship.isSunk()).toBe(true)
    expect(cruiser.isSunk()).toBe(false)
})