
//FRONTEND ROOM
let enterRoom = async function (key) {
    console.log("Entered room: " + key);
    toggleElements("room-prompt", "room-lobby");

    const user = firebase.auth().currentUser;

    document.getElementById("room-display").innerHTML = "room: " + key;

    const fetch_users = database.ref("rooms/" + key + "/users");
        let playerList = document.getElementById("player-list");
        let roomInfo = await getSnapshot(
            "rooms/" + key + "/room-info", (snapshot) => {return snapshot.toJSON();}
    );

    fetch_users.on("child_added", function (snapshot) {
        let uid = snapshot.key;
        playerList.innerHTML += `<li class=${
            uid == user.uid ? "list-self" : "list-user"
        }>${snapshot.child("name").val()}</li>`;
    });

    fetch_users.on("child_removed", function (snapshot) {
        const usr = snapshot.toJSON();
        let cls = usr.uid == user.uid ? "list-self" : "list-user";
        let li = `<li class="${cls}">${usr.name}</li>`;
        playerList.innerHTML = playerList.innerHTML.replace(li, "");
        //för att byta skärm om du blir kickad
        if (usr.uid == user.uid) {
            exitRoom()
        }});

    document.documentElement.style.setProperty("--user-crossed",
        roomInfo.owner == user.uid ? "line-through" : "normal"
    );
};

//FRONTEND LEAVE
let exitRoom = function(){
    toggleElements("room-lobby", "room-prompt");
    roomKey = null;
}