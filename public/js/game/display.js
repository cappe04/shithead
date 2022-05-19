

async function initUIListeners() {
    const deckPath = "rooms/" + roomKey + "/game" + "/deck"
    const deck = database.ref(deckPath);
    const stack = database.ref("rooms/" + roomKey + "/game" + "/stack");
    const uids = Object.keys(await getUsers(roomKey))

    deck.on("child_removed", async removedSnapshot => {
        await getSnapshot(deckPath, snapshot => {
            document.querySelector("#deck-card-counter")
                .innerHTML = Object.keys(snapshot.toJSON()).length.toString()
        })
    })

    stack.on("child_added", (snapshot) => {
        // Lägg till det tillagda kortet högst upp
        console.log(snapshot.toJSON())
    })

    stack.on("child_removed", (snapshot) => {
        // Ta bort hela högen (vända högen)
    })

    for (let uid of uids) {
        const userRef = database.ref("rooms/" + roomKey + "/users/" + uid)
        
        if (uid == firebase.auth().currentUser.uid) {
            const selfCardCounter = document.querySelector("#self-card-counter");

            userRef.child("hand").on("child_added", snapshot => {
                selfCardCounter.innerHTML = parseInt(selfCardCounter.innerHTML) + 1
                // Det nya kortet (snapshot) måste läggas till i handen 
                const data = snapshot.toJSON()
                UIAddHandCard(snapshot.key, data.value, {"clubs": 0, "diamonds": 1, "hearts": 2, "spades": 3}[data.suitName])
            })

            userRef.child("hand").on("child_removed", snapshot => {
                selfCardCounter.innerHTML = parseInt(selfCardCounter.innerHTML) - 1
                // Kortet (snapshot) måste försvinna från handen
            })

            userRef.child("viscards").on("child_added", snapshot => {
                const data = snapshot.toJSON()
                UISetBaseCard("player", snapshot.key, data.value, {"clubs": 0, "diamonds": 1, "hearts": 2, "spades": 3}[data.suitName])
            })

            
        } else {
            const userCardCounter = document.querySelector(`#${uid}-card-counter`)
            
            // Hand listeners on opponents
            userRef.child("hand").on("child_added", snapshot => {
                userCardCounter.innerHTML = parseInt(userCardCounter.innerHTML) + 1
            })
            userRef.child("hand").on("child_removed", snapshot => {
                userCardCounter.innerHTML = parseInt(userCardCounter.innerHTML) - 1
            })

            userRef.child("viscards").on("child_added", snapshot => {
                const data = snapshot.toJSON()
                UISetBaseCard(uid, snapshot.key, data.value, {"clubs": 0, "diamonds": 1, "hearts": 2, "spades": 3}[data.suitName])
            })

            // Visible card listeners on opponents
            userRef.child("hidcards").on("child_removed", (snapshot) => {
                // Ta bort rätt kort med avseende på id
                console.log(snapshot.key)
            })

            // Hidden card listeners on opponents
            userRef.child("hidcards").on("child_removed", (snapshot) => {
                // Ta bort rätt kort med avseende på id
                console.log(snapshot.key)
            })
        }
    }
}

function UIAddUser(uid){
    document.getElementById("opponents-container").innerHTML += `<div class="opponent">
        <div class="base">
            <div class="playing-card" id="${uid}-card0"></div>
            <div class="playing-card" id="${uid}-card1"></div>
            <div class="playing-card" id="${uid}-card2"></div>
        </div>
        <div id="${uid}-card-counter" class="card-counter">0</div>
    </div>`
}

function UISetBaseCard(uid, index, value, suit){
    const card = new Card((value-1)*4, suit)
    document.getElementById(`${uid}-card${index}`)
        .innerHTML = `<img class="front-face" src="../public/images/all cards/${card.name}.png">`
}

function UIAddHandCard(index, value, suit) {
    const card = new Card((value-1)*4, suit)
    document.querySelector("#hand").innerHTML += `
    <div id="hand-card${index}" class="playing-card">
        <img class="front-face" src="../public/images/all cards/${card.name}.png">
    </div>
    `
}