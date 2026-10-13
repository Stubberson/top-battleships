const { Player } = require('../src/player.js')

test('should create a player object', () => {
    const player = new Player('player1')
    expect(player).toBeDefined()
    expect(player.name).toBe('player1')
})