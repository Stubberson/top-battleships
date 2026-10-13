import { Board } from './gameboard.js'

class Player {
    constructor(name = undefined) {
        this.name = name
        this.gameboard = new Board()
    }
}

export { Player }