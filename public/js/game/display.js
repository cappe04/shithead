function initListeners() {
    const deck = database.ref("rooms/" + roomKey + "/game" + "/deck");
    const stack = database.ref("rooms/" + roomKey + "/game" + "/stack");
    const users = await getUsers(roomKey);

    userIterator:
    for (let user of users) {
        const userRef = database.ref("rooms/" + roomKey + "/users/" + user)
        if (user == firebase.auth().currentUser.uid) {

        } else {
            userRef.child("hand").on("child_added", (snapshot) => {

            })

        }

        
    }
}

function UIAddUser(uid){
    const html = 
    `<div class="opponent">
        <div class="base">
            <div class="playing-card" id="${uid}-card1"></div>
            <div class="playing-card" id="${uid}-card2"></div>
            <div class="playing-card" id="${uid}-card3"></div>
        </div>
        <div id="${uid}-card-counter" class="card-counter">5</div>
    </div>`

    document.getElementById("opponents-container").innerHTML += html
}

