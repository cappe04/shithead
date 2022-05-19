

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
            // Hand listeners on client
            // Fixa på sin egen hand så rätt kort visas
            
        } else {
            const userCardCounter = document.querySelector(`#${uid}-card-counter`)
            // Hand listeners on opponents
            userRef.child("hand").on("child_added", (snapshot) => {
                userCardCounter.innerHTML = parseInt(userCardCounter.innerHTML) + 1
            })
            userRef.child("hand").on("child_removed", (snapshot) => {
                userCardCounter.innerHTML = parseInt(userCardCounter.innerHTML) - 1
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

function setUICard(uid, index, value, suit){
    const card = new Card((value-1)*4, suit)
    document.getElementById(`${uid}-card${index}`).innerHTML = `<img class="front-face" src="../public/images/all cards/${card.name}.png">`
}
