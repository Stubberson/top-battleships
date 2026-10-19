function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

function placeFleet() {
    
}

function computerAttack(playerBoard) {
    const row = getRandomInt(10)
    const cell = getRandomInt(10)
    
    if (playerBoard.children[row].children[cell].className !== 'hit' && playerBoard.children[row].children[cell].className !== 'miss') {
        playerBoard.children[row].children[cell].click()
    } else {
        computerAttack(playerBoard)
    }
}

export { computerAttack }