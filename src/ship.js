class Ship {
    constructor(size) {
        if (size < 2 || size > 5) throw new Error('Ship size not allowed')
        this.size = size
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