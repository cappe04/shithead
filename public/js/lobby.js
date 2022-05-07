const joinRoomForm = document.querySelector("#join-room-form");
const createRoom = document.querySelector("#btn-create-room");
const leaveRoom = document.querySelector("#btn-leave-room");
const startGame = document.querySelector("#btn-start-game");
const playerList = document.querySelector("#player-list");

var roomKey;

//JOIN ROOM
joinRoomForm.addEventListener("submit", async event => {
    event.preventDefault();

    const user = firebase.auth().currentUser;
    const key = joinRoomForm.key.value;

    let users = await getUsers(key);

    if (Object.keys(users).length < 4) {
        if (!(await userInRoom(user, key))) {
            joinRoom(key, user);
        } else {
            //blir endast kallad om man stänger sidan och försöker joina igen.
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

    // branch.on("child_removed", async function (e) {
    //     await getSnapshot("rooms/" + key, function (snapshot) {
    //         if (!snapshot.child("users").exists()) {
    //             database.ref("rooms/" + key).remove();
    //         }
    //     });
    // });
});

// Leave the room
leaveRoom.addEventListener("click", async event => {
    const user = firebase.auth().currentUser;
    await getSnapshot("rooms/" + roomKey + "/users", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.toJSON().uid == user.uid) {
                childSnapshot.ref.remove(); //har även en .key atribut
            }
        });
    });
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


// ---------------- BACK END FUNCTIONS ----------------


async function getSnapshot(path, callback) {
    let value;
    await database.ref(path).once("value").then(function (snapshot) {
        value = callback(snapshot);
    });
    return value;
};

async function getUsers(key) {
    return getSnapshot("rooms/" + key + "/users", (snapshot) =>
        snapshot.toJSON()
    );
};

let userInRoom = async function (user, key) {
    let users = await getUsers(key);
    return Object.keys(users).includes(user)
};

let joinRoom = function (key, user) {
    let branch = database.ref("rooms/" + key + "/users/" + user.uid);
    console.log(userPackage(user))
    
    branch.set(userPackage(user))
    
    console.log("Joined room: " + key);
    roomKey = key
    enterRoom(key);
};

let userPackage = function (user) {
    return {
        name: user.displayName,
        hand: false, //kan inte vara {} för childen tas bort. så .validate fungerar inte
    };
};

let generateKey = async function () {
    let key = Math.random().toString(36).slice(2, 6);
    return (await roomExists(key)) ? generateKey() : key;
};

let roomExists = async function (key) {
    let exists;
    await database.ref("rooms/" + key).once("value").then(function (snapshot) {
        exists = snapshot.exists();
    });
    return exists;
};



