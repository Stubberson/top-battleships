import { Player } from '../src/player.js'
import { renderBoard } from '../src/renderer.js'

// create a mock player board
document.body.innerHTML = '<div class="board">' + '</div>'
const board = document.querySelector('.board')
const player = new Player()

test('should render 10 rows with 10 cells each', () => {
    renderBoard(player, board)

    expect(document.querySelectorAll('.board-row')).toHaveLength(10)
    expect(document.querySelector('.board-row').children).toHaveLength(10)
})

test('should listen to and receive attacks on click', () => {
    // render board and emulate clicks
    renderBoard(player, board)
    board.firstChild.firstChild.click()  // board[0][0]
    board.lastChild.lastChild.click()   // board[9][9]
    
    expect(player.gameboard.board[0][0]).toBe(-1)
    expect(player.gameboard.board[9][9]).toBe(-1)
    expect(player.gameboard.board[1][0]).toBe(0)
})