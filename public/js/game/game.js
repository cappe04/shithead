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
        this.shuffle()

        this.ref = database.ref("rooms/" + roomKey + "/game/deck")
        this.path = "rooms/" + roomKey + "/game/deck"
    }

    get(){
        return getSnapshot(this.path, snapshot => {
            Object.values(snapshot.toJSON())
        })
    }

    getTop(){
        return this.get().at(-1)
    }

    removeTop(){
        this.ref.child((get().length-1).toString()).remove()
    }

    draw(user){
        let card = this.getTop()
        this.removeTop()
        database.ref("rooms/" + roomKey + "/users/" + user.uid + "/hand").push(card)
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

class Stack {
    constructor(){
        this.ref = database.ref("rooms/" + roomKey + "/game/stack")
        this.path = "rooms/" + roomKey + "/game/stack"
    }

    get(){
        return getSnapshot(this.path, snapshot => {
            Object.values(snapshot.toJSON())
        })
    }

    getTop(){
        return this.get().at(-1)
    }

    add(card){
        this.ref.push(card)
    }

    clear(){
        this.ref.remove()
    }
}

function removeFromHand(cardName){
    const user = firebase.auth().currentUser
    const path = "rooms/" + roomKey + "/users/" + user.uid + "/hand"
    getSnapshot(path, snapshot => {
        snapshot.forEach(element => {
            if (element.toJSON().name == cardName){
                element.ref.remove()
            }
        });
    })
}

function layCard(){
    const game = database.ref("rooms/" + roomKey + "/game")
    const players = Object.keys(getUsers(roomKey))
    const user = firebase.auth().currentUser

    let card; // få ut ett riktigt kort
    let stack = new Stack()
    if(card.value >= stack.getTop().value){ // fixa alla speciella fall
        removeFromHand(card.name)
        stack.add(card)
        game.child("turn").set(turn+1)
    }
}

async function dealCards () {
    const roomPath = "rooms/" + roomKey
    const deckRef = database.ref(roomPath + "/game" + "/deck")
    const deck = await getSnapshot(deckRef, async function(snapshot) {
        return await snapshot.toJSON();
    })
    const players = getUsers(roomKey);
    let n = 0;
    for (let i = 0; i<3; i++) {
        for (let j = 0; j<3; j++) {
            for (let k = 0; k<players.length; k++) {
                n++
                let card = deck[52-n]
                switch (i) {
                    case 0:
                        database.ref(roomPath + "/users" + players[k] + "/viscards").push(card)
                        break;
                    case 1:
                        database.ref(roomPath + "/users" + players[k] + "/hidcards").push(card)
                        break;
                    case 2:
                        database.ref(roomPath + "/users" + players[k] + "/hand").push(card)
                        break;
                }
            }
        }
    }
    getSnapshot("rooms/" + roomKey + "/game" + "/deck", function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            if (childSnapshot.key >= 52-n) {
                childSnapshot.remove()
            }
        })
    })
}

async function moveCards (from, to) {

}
