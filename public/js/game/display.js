

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


