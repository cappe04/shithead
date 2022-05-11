const joinRoomForm = document.querySelector("#join-room-form");
const createRoom = document.querySelector("#btn-create-room");
const leaveRoom = document.querySelector("#btn-leave-room");
const startGame = document.querySelector("#btn-start-game");
const playerList = document.querySelector("#player-list");

//JOIN ROOM
joinRoomForm.addEventListener("submit", async event => {
    event.preventDefault();

    const user = firebase.auth().currentUser;
    const key = joinRoomForm.key.value;

    let users = await getUsers(key);

    if (Object.keys(users).length < 4) {
        if (!(await userInRoom(user.uid, key))) {
            joinRoom(key, user);
            console.log("user in room = false")
        } else {
            //blir endast kallad om man stänger sidan och försöker joina igen.
            console.log(" userInRoom = true")
            enterRoom(key);
            roomKey = key
        }
    } else {
        console.log("Room is full!");
    }

})

//CREATE ROOM
createRoom.addEventListener("click", async event => {
    const key = await generateKey();
    const branch = database.ref("rooms/" + key);
    const user = firebase.auth().currentUser;
    let package = {
        users: [],
        "room-info": {
            created: Date.now(),
            owner: user.uid,
            playing: false
        },
    };
    branch.set(package);
    joinRoom(key, user);
});

// LEAVE ROOM
leaveRoom.addEventListener("click", async event => {
    const user = firebase.auth().currentUser;

    let roomInfo = await getSnapshot(
        "rooms/" + roomKey + "/room-info", (snapshot) => {return snapshot.toJSON();}
    )

    if(user.uid = roomInfo.owner){
        database.ref("rooms/" + roomKey).remove()
    }

    document.getElementById("player-list").innerHTML = "<u>Players:</u>";
    //stänger av event listener för child_added. Viktigt för ens namn ska synas flear gånger
    database.ref("rooms/" + roomKey + "/users").off("child_added");
    database.ref("rooms/" + roomKey + "/users").off("child_removed"); //bara för att.

    toggleElements("room-lobby", "room-prompt");
    roomKey = null;
})

// Start the game
startGame.addEventListener("click", async event => {
    toggleElements("menu", "game");
})

// Remove player when clicking their name
playerList.addEventListener("click", event => {
    let playerName = event.target.innerHTML;
    removeUserFromRoom(roomKey, playerName);
})



