
//FRONTEND ROOM
let enterRoom = async function (key) {
    console.log("Entered room: " + key);
    toggleElements("room-prompt", "room-lobby");

    const user = firebase.auth().currentUser;

    document.getElementById("room-display").innerHTML = "room: " + key;

    const fetch_users = database.ref("rooms/" + key + "/users");
    const fetch_chat = database.ref("rooms/" + key + "/chat");
    const fetch_gamestate = database.ref("rooms/" + key + "/room-info/playing")

    const playerList = document.getElementById("player-list");
    const chat = document.getElementById("room-chat");

    let roomInfo = await getSnapshot(
            "rooms/" + key + "/room-info", (snapshot) => {return snapshot.toJSON();}
    );

    //USER JOINED
    fetch_users.on("child_added", function (snapshot) {
        let uid = snapshot.key;
        playerList.innerHTML += `<li class=${
            uid == user.uid ? "list-self" : "list-user"
        }>${snapshot.child("name").val()}</li>`;
    });

    //CHAT
    fetch_chat.on("child_added", function (snapshot) {
        let message_data = snapshot.toJSON()
        chat.innerHTML += `<li class=${
            message_data.uid == user.uid ? "chat-self" : "chat-other"
        }>${message_data.name}: ${message_data.message}</li>`
    })

    //USER LEAVE
    fetch_users.on("child_removed", function (snapshot) {
        let usr = snapshot.toJSON();
        usr.uid = snapshot.key
        
        let cls = usr.uid == user.uid ? "list-self" : "list-user";
        let li = `<li class="${cls}">${usr.name}</li>`;
        playerList.innerHTML = playerList.innerHTML.replace(li, "");
        //för att byta skärm om du blir kickad
        console.log(usr.uid)
        if (usr.uid == user.uid) {
            roomChat.innerHTML = "";
            exitRoom()
        }});

    //GAME STARTED OR ENDED
    fetch_gamestate.on("value", snapshot => {
        snapshot.val() ? enterGame() : exitGame()
    })

    document.documentElement.style.setProperty("--user-crossed",
        roomInfo.owner == user.uid ? "line-through" : "normal"
    );
};

//LEAVE
let exitRoom = function(){
    database.ref("rooms/" + roomKey + "/users").off("child_added");
    database.ref("rooms/" + roomKey + "/chat").off("child_added");

    database.ref("rooms/" + roomKey + "/users").off("child_removed");

    toggleElements("room-lobby", "room-prompt");
    roomKey = null;
}

//START GAME
var turn = 0;

let enterGame = async function(){
    toggleElements("menu", "game");
    const game = database.ref("rooms/" + roomKey + "/game")
    const players = Object.keys(getUsers(roomKey))
    const user = firebase.auth().currentUser
    const roomInfo = await getSnapshot(
        "rooms/" + roomKey + "/room-info", (snapshot) => {return snapshot.toJSON();}
    );

    if(user.uid == roomInfo.owner){
        let deck = new Deck()
        game.set({
            stack: false,
            deck: deck.deck,
            turn: turn
        })
        dealCards()
        //allt som bara behöver köra en gång
    }

    game.child("turn").on("value", snapshot => {
        turn = snapshot.val()
        // någon indikation på vems tur det är
        if(players[turn] == user.uid){
            // vad som händer när det blir din tur
        } else {
            // vad som händer när det är någon annans tur
        }
    })

}

//LEAVE GAME
let exitGame = function(){
    const game = database.ref("rooms/" + roomKey + "/game")
    game.child("turn").off("value")
}