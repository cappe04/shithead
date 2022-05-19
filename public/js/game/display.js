

function initListeners() {
    const deck = database.ref("rooms/" + roomKey + "/game" + "/deck");
    const stack = database.ref("rooms/" + roomKey + "/game" + "/stack");
    const uids = Object.keys(getUsers(roomKey))

    userIterator:
    for (let uid of uids) {
        const userRef = database.ref("rooms/" + roomKey + "/users/" + user)
        const userCardCounter = document.querySelector(`#${uid}-card-counter`)
        
        if (user == firebase.auth().currentUser.uid) {
            // Hand listeners on client
            // Fixa på sin egen hand så rätt kort visas
            
        } else {
            // Hand listeners on oponents
            userRef.child("hand").on("child_added", (snapshot) => {
                userCardCounter.innerHTML = userCardCounter.value + 1
            })
            userRef.child("hand").on("child_removed", (snapshot) => {
                userCardCounter.innerHTML = userCardCounter.value - 1
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
        <div id="${uid}-card-counter" class="card-counter"></div>
    </div>`
}

function setUICard(uid, index, value, suit){
    const card = new Card((value-1)*4, suit)
    document.getElementById(`${uid}-card${index}`).innerHTML = `<img class="front-face" src="../public/images/all cards/${card.name}.png">`
}
