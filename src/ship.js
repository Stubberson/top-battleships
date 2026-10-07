class Ship {
    constructor(type) {
        this.type = type
        switch (this.type) {
            case 'carrier':
                this.size = 5
                break
            case 'battleship':
                this.size = 4
                break
            case 'cruiser':
                this.size = 3
                break
            case 'submarine':
                this.size = 3
                break
            case 'destroyer':
                this.size = 2
        }
        this.hits = 0
        this.sunk = false
    }

    hit() {
        if (this.hits < this.size) this.hits++
    }

    isSunk() {
        if (this.hits === this.size) {
            this.sunk = true
        }
        return this.sunk
    }
}

module.exports = { Ship }