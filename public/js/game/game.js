class Card {
    constructor(value, suit) {
        switch (Math.floor(value / 4) + 1) {
            case 1:
                this.rank = "ace"; break;
            case 11:
                this.rank = "jack"; break;
            case 12:
                this.rank = "queen"; break;
            case 13:
                this.rank = "king"; break;
            default:
                this.rank = Math.floor(value / 4) + 1
        }
        this.suit = ["♣", "♦", "♥", "♠"][suit];
        this.suitName = ["clubs", "diamonds", "hearts", "spades"][suit]
        this.name = this.rank + " of " + this.suitName
        this.value = Math.floor(value / 4) + 1
    }
}

class Deck {
    constructor() {
        this.deck = []
        for (let i = 0; i < 52; i++) {
            this.deck.push(new Card(i, i % 4))
        }
    }

    peek() {
        for (let card of this.deck) {
            console.log(card)
        }
    }

    shuffle(iterations = 10) {
        for (let i = 0; i < iterations; i++) {
            let deckLength = this.deck.length
            let half = this.deck.slice(0, Math.floor(deckLength / 2))
            let otherHalf = this.deck.slice(Math.floor(deckLength / 2), deckLength)
            for (let j = 0; j < deckLength; j++) {
                if (j % 2 === 0) {
                    this.deck[j] = half[Math.floor(j / 2)]
                } else {
                    this.deck[j] = otherHalf[Math.floor(j / 2)]
                }
            }
        }
    }
}
