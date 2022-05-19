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


