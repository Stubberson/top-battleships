class Ship {
    constructor(size) {
        this.size = size
        this.hits = 0
        this.sunk = false
    }

    hit() {
        this.hits++
    }

    isSunk() {
        if (this.hits === this.size) {
            this.sunk = true
        }
        return this.sunk
    }
}

module.exports = { Ship }