import { Player } from '../src/player.js'
import { renderBoard } from '../src/renderer.js'

// set up a mock board
document.body.innerHTML = '<div class="board">' + '</div>'
const board = document.querySelector('.board')

test('should create a player object', () => {
    const player = new Player('player1')
    expect(player).toBeDefined()
    expect(player.name).toBe('player1')
})

test('should define all ships', () => {
    const player = new Player()
    
    player.placeRandomFleet()
    
    const ships = Object.values(player.gameboard.fleet)
    expect(ships.every(ship => ship !== undefined)).toBeTruthy()
})

test('should place all ships in allowed squares', () => {
    const player = new Player()
    player.placeRandomFleet()

    const carrier = player.gameboard.fleet['carrier']
    const battleship = player.gameboard.fleet['battleship']
    const cruiser = player.gameboard.fleet['cruiser']
    const submarine = player.gameboard.fleet['submarine']
    const destroyer = player.gameboard.fleet['destroyer']

    expect(carrier['coords'].flat().every(coord => coord >= 0 && coord < 10)).toBeTruthy()
    expect(battleship['coords'].flat().every(coord => coord >= 0 && coord < 10)).toBeTruthy()
    expect(cruiser['coords'].flat().every(coord => coord >= 0 && coord < 10)).toBeTruthy()
    expect(submarine['coords'].flat().every(coord => coord >= 0 && coord < 10)).toBeTruthy()
    expect(destroyer['coords'].flat().every(coord => coord >= 0 && coord < 10)).toBeTruthy()
})

test('should record an attack', () => {
    const player = new Player()
    player.placeRandomFleet()
    
    renderBoard(player, board)
    
    player.computerAttack(player, board)
    
    // above attack should result in either hitting one ship (1) or one miss (-1)
    const allSquares = player.gameboard.board.flat()
    expect(allSquares.filter(sqr => sqr === 1 || sqr === -1)).toHaveLength(1)
})