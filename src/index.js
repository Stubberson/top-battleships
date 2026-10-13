import './style.css'
import { Player } from './player.js'

const playerOne = new Player()

// Create HTML for the board
let fleetBoard = document.querySelector('div')
for (const r of playerOne.gameboard.board) {
    let row = document.createElement('div')
    row.className = 'row'
    for (const i of r) {
        let cell = document.createElement('div')
        row.appendChild(cell)
    }
    fleetBoard.appendChild(row)
}