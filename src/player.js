import { Board } from './gameboard.js'
import { getRandomInt } from './renderer.js'

class Player {
    constructor(name = undefined) {
        this.name = name
        this.gameboard = new Board()
    }

    // *** PUBLIC METHODS ***
    placeRandomFleet() {
        // places the fleet on random coordinates
        const fleet = Object.keys(this.gameboard.fleet)
        fleet.forEach(ship => {
            switch (ship) {
                case 'carrier':
                    this.#findAllowedPlacement(ship, 5)
                    break
                case 'battleship':
                    this.#findAllowedPlacement(ship, 4)
                    break
                case 'cruiser':
                    this.#findAllowedPlacement(ship, 3)
                    break
                case 'submarine':
                    this.#findAllowedPlacement(ship, 3)
                    break
                case 'destroyer':
                    this.#findAllowedPlacement(ship, 2)
                    break
            }
        })
        console.log(this.gameboard)
    }

    placeOwnFleet() {
        this.gameboard.placeShip(type, coords1, coords2)
    }

    computerAttack(player, playerBoard) {
        const hits = this.#getAllHits(player)
        const nextAttacks = this.#getReasonableAttacks(player, hits).flat()
        if (hits.length > 0 && nextAttacks.length > 0) {
            const target = nextAttacks[getRandomInt(nextAttacks.length)]
            if (!playerBoard.children[target[1]].children[target[0]].classList.contains('hit') && 
                !playerBoard.children[target[1]].children[target[0]].classList.contains('miss')) 
            {
                playerBoard.children[target[1]].children[target[0]].click()
            } else {
                this.computerAttack(player, playerBoard)
            }
        } else {
            let x = getRandomInt(10)
            let y = getRandomInt(10)

            // children[y] is the row, so y-coordinate, and children[y].children[x] is the column
            if (!playerBoard.children[y].children[x].classList.contains('hit') && 
                !playerBoard.children[y].children[x].classList.contains('miss')) 
            {
                playerBoard.children[y].children[x].click()
            } else {
                this.computerAttack(player, playerBoard)
            }
        }
    }

    // *** PRIVATE METHODS ***
    #findAllowedPlacement(ship, size) {
    // random ship placement might result in unallowed placement, brute-force correct placement
        let endCoord, x, y
        do {
            x = getRandomInt(10)
            y = getRandomInt(10)
            if (x < 5) {  // randomize ship orientation
                endCoord = [x + (size - 1), y]
            } else {
                y < 5  // make sure that ship isn't placed outside board
                    ? endCoord = [x, y + (size - 1)]
                    : endCoord = [x, y - (size - 1)]
            }

        } while (!this.gameboard.placeShip(ship, [x, y], endCoord))
    }

    #getAllHits(player) {
        const allSquares = player.gameboard.board.flat()
        let hitSquares = []
        allSquares.forEach((sqr, i) => {
            if (sqr === 1) {  // 1 means that a ship has been hit
                i < 10
                    ? hitSquares.push(`0${i}`)
                    : hitSquares.push(i.toString())
            }
        })
    
        return hitSquares.map(str => str.split('').map(Number).reverse())
    }

    #getReasonableAttacks(player, hits) {
        // retrieve the hits on ships that aren't sunk
        let hitsOfInterest = []
        const fleet = Object.values(player.gameboard.fleet)
        for (let i = 0; i < fleet.length; i++) {
            if (fleet[i] && !fleet[i]['shipInstance'].isSunk()) {
                hitsOfInterest.push(fleet[i]['coords'].filter(pair => 
                    hits.some(c => pair[0] === c[0] && pair[1] === c[1])
                ))
            }
        }

        // get neighbouring squares
        let reasonableNextAttacks = []
        for (let i = 0; i < hitsOfInterest.length; i++) {
            hitsOfInterest[i].forEach(c => 
                reasonableNextAttacks.push(this.#getAdjacentSquares(c, hits))
            )
        }

        return reasonableNextAttacks
    }

    #getAdjacentSquares(square, hits) {
        const sign = [1, 1, -1, -1]  // helps to switch the sign (+/-)
        let possibleSquares = []
        let i = 0
        while (i < 4) {
            let newSquare
            if (i % 2 === 0) {
                let dX = square[0] + sign[i]
                newSquare = [dX, square[1]]
            } else {
                let dY = square[1] + sign[i]
                newSquare = [square[0], dY]
            }

            // ensure that newSquare is within the board and not already hit
            if (!newSquare.some(c => c < 0 || c > 9) && 
                !hits.some(s => s[0] === newSquare[0] && s[1] === newSquare[1])) 
            {
                possibleSquares.push(newSquare)
            }
            i++
        }
        return possibleSquares
    }
}

export { Player }