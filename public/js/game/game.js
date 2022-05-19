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

    shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * i);
            this.temp = this.deck[i];
            this.deck[i] = this.deck[j];
            this.deck[j] = this.temp;
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

    async draw(user){
        let card = this.getTop()
        this.removeTop()
        this.get().then(deck => {
            database.ref("rooms/" + roomKey + "/users/" + user.uid + "/hand/" + (deck.length - 1)).set(card)
        })
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

let onHandCardClick = index => {
    const gamePath = "rooms/" + roomKey + "/game"
    const user = firebase.auth().currentUser
    const uids = Object.keys(await getUsers(roomKey))
    const turn = await getSnapshot(gamePath + "/turn", snapshot => {
        return snapshot.val()        
    })

    if(user.uid == uids[turn]){
        const cardRef = database.ref("rooms/" + roomKey + "/users/" + user.uid + "/hand/" + index)
        let data = cardRef.toJSON()
        layCard(data.value, {"clubs": 0, "diamonds": 1, "hearts": 2, "spades": 3}[data.suitName])
        // remove div
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

function layCard(value, suit){
    const game = database.ref("rooms/" + roomKey + "/game")
    const players = Object.keys(getUsers(roomKey))
    const user = firebase.auth().currentUser

    let card = new Card(value, suit)
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
                database.ref(roomPath + "/users/" + uid + "/hidcards/" + i).set(card)
            })
            deck.removeTop()
        }

        for(let i = 0; i<3; i++){
            await deck.getTop().then(card => {
                database.ref(roomPath + "/users/" + uid + "/viscards/" + i).set(card)
            })
            deck.removeTop()
        }

        for(let i = 0; i<3; i++){
            await deck.getTop().then(card => {
                database.ref(roomPath + "/users/" + uid + "/hand/" + i).set(card)
            })
            deck.removeTop()
        }
    }
}