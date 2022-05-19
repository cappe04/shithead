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
        this.name = this.rank + "_of_" + this.suitName
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

class DeckOp{
    constructor() {
        this.ref = database.ref("rooms/" + roomKey + "/game/deck")
        this.path = "rooms/" + roomKey + "/game/deck"
    }

    async get(){
        return await getSnapshot(this.path, snapshot => {
            return Object.values(snapshot.toJSON())
        })
    }

    async getTop(){
        let deck = await this.get()
        return deck.at(-1)
    }

    removeTop(){
        this.get().then(deck => {
            this.ref.child((deck.length-1).toString()).remove()        
        })
    }

    draw(user){
        let card = this.getTop()
        this.removeTop()
        database.ref("rooms/" + roomKey + "/users/" + user.uid + "/hand").push(card)
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
        game.child("turn").set((turn+1)%players.length)
    }
}

async function dealCards () {
    const roomPath = "rooms/" + roomKey
    const deck = new DeckOp()

    const users = await getUsers(roomKey)
    const uids = Object.keys(users)

    for(let uid of uids){

        database.ref(roomPath + "/users/" + uid + "/hidcards").remove()
        database.ref(roomPath + "/users/" + uid + "/viscards").remove()
        database.ref(roomPath + "/users/" + uid + "/hand").remove()

        for(let i = 0; i<3; i++){
            await deck.getTop().then(card => {
                database.ref(roomPath + "/users/" + uid + "/hidcards").push(card)
            })
            deck.removeTop()
        }

        for(let i = 0; i<3; i++){
            await deck.getTop().then(card => {
                database.ref(roomPath + "/users/" + uid + "/viscards").push(card)
            })
            deck.removeTop()
        }

        for(let i = 0; i<3; i++){
            await deck.getTop().then(card => {
                database.ref(roomPath + "/users/" + uid + "/hand").push(card)
            })
            deck.removeTop()
        }
    }
}

async function moveCards (from, to) {

}
