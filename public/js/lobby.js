const joinRoomForm = document.querySelector("#join-room-form");
const createRoom = document.querySelector("#btn-create-room");
const leaveRoom = document.querySelector("#btn-leave-room");
const startGame = document.querySelector("#btn-start-game");
const playerList = document.querySelector("#player-list");


var roomKey;

// Join a room
joinRoomForm.addEventListener("submit", async event => {
    event.preventDefault();

    const user = firebase.auth().currentUser;
    const key = joinRoomForm.key.value;

    let users = await getUsers(key);
      if (users.length < 4) {
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

// Create a room
createRoom.addEventListener("click", async event => {
    const key = await generateKey();
    const branch = database.ref("rooms/" + key);
    const user = firebase.auth().currentUser;
    let package = {
      users: [],
      "room-info": {
        created: Date.now(),
        owner: user.uid,
      },
    };
    branch.set(package);
    joinRoom(key, user);

    branch.on("child_removed", async function (e) {
      await getSnapshot("rooms/" + key, function (snapshot) {
        if (!snapshot.child("users").exists()) {
          database.ref("rooms/" + key).remove();
        }
      });
    });
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