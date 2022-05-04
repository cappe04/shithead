const firebaseConfig = {
    apiKey: "AIzaSyCeIhmX88wai4cphbcH2_ZTifGV636XkQ0",
    authDomain: "shithead-fda25.firebaseapp.com",
    databaseURL: "https://shithead-fda25-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "shithead-fda25",
    storageBucket: "shithead-fda25.appspot.com",
    messagingSenderId: "335043860876",
    appId: "1:335043860876:web:a9e7e4a842ea3bcfb6dea9",
    measurementId: "G-50K3MBX143"
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

var user;

firebase.auth().onAuthStateChanged(firebaseUser => {
    if (!firebaseUser) {
        firebase.auth().signInAnonymously();
    }
    user = firebaseUser
})

document.getElementById("btn-enter-username").addEventListener("click", e => {
    user.nickname = document.getElementById("entry-nickname").value;
    toggleElements("nickname-prompt", "room-prompt")
    document.getElementById("name-display").innerHTML = `Your name is now ${user.nickname}, click the button below if you want to change it.`
});

document.getElementById("btn-change-name").addEventListener("click", e => {
    toggleElements("room-prompt", "nickname-prompt")
})

let roomExists = async function(key){
    let exists;
    await database.ref("rooms/" + key).once("value").then(function(snapshot) {
        exists = snapshot.exists()
    })
    return exists
}

let generateKey = async function (){
    let key = Math.random().toString(36).slice(2, 6)
    return await roomExists(key) ? generateKey(): key
}

let userPackage = function(user, owner=false){
    return {
        name: user.nickname,
        uid: user.uid
    }
}

let userInRoom = async function (user, key) {
    let inRoom = false;
    await database.ref("rooms/" + key + "/users").once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            if (childSnapshot.child("uid").val() == user.uid) {
                inRoom = true;
            }
        })
    })
    return inRoom;
}

async function getSnapshot(path, func){
    let value;
    await database.ref(path).once("value").then(function(snapshot) {
        value = func(snapshot)
    })
    return value
}

let getUsers = async function (key) {
    return getSnapshot("rooms/" + key + "/users", (snapshot) => Object.values(snapshot.toJSON()))
}

let joinRoom = function (key, user) {
    let branch = database.ref("rooms/" + key);
    branch.child("users").push(userPackage(user));
    console.log("Joined room: " + key)
    enterRoom(key)
}

let enterRoom = async function(key){
    console.log("Entered room: " + key)
    toggleElements("room-prompt", "room-lobby");

    document.getElementById("room-display").innerHTML = "room: " + key

    const fetch_users = database.ref("rooms/" + key + "/users")
    let playerList = document.getElementById("player-list")
    let roomInfo = getSnapshot("rooms/" + key + "room-info", (snapshot) => {return snapshot.toJSON()})
    //let users = await getUsers(key)

    fetch_users.on("child_added", function(snapshot){
        let u = snapshot.toJSON()
        //console.log("child_added")
        playerList.innerHTML += `<li class=${u.uid == user.uid ? "list-self": "list-user"}>${u.name}</li>`
        console.log(playerList.innerHTML)
    })

    fetch_users.on("child_removed", function(snapshot){
        const usr = snapshot.toJSON()
        let cls = usr.uid == user.uid ? "list-self" : "list-user"
        let li = `<li class="${cls}">${usr.name}</li>`
        playerList.innerHTML = playerList.innerHTML.replace(li, "")
        fetch_users.off("value") //stäng av event listener
    })

    document.documentElement.style.setProperty("--user-crossed", roomInfo.owner == user.uid ? "line-through" : "normal")

}

//CREATE ROOM
document.getElementById("btn-create-room").addEventListener("click", async function() {
    let key = await generateKey()
    let branch = database.ref("rooms/" + key)
    let package = {
        "users": [],
        "room-info": {
            created: Date.now(),
            owner: user.uid
        }
    }
    branch.set(package)
    joinRoom(key, user)
})

//JOIN ROOM
document.getElementById("btn-join-room").addEventListener("click", async function (){
    let key = document.getElementById("room-key-entry").value
    if (await roomExists(key)){
        let users = await getUsers(key)
        if (users.length < 4) {
            if (! await userInRoom(user, key)) {
                joinRoom(key, user)
            } else {
                enterRoom(key)
            }
        } else {
            console.log("Rooms is full!")
        }
    } else {
        console.log("Room doesn't exist")
    }
})

//LEAVE ROOM
document.getElementById("btn-leave-room").addEventListener("click", async function () {
    let key = document.getElementById("room-display").innerHTML;
    key = key.slice(key.length - 4, key.length)
    await getSnapshot("rooms/" + key + "/users", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            if (childSnapshot.toJSON().uid == user.uid){
                childSnapshot.ref.remove() //har även en .key atribut
            }
        })
    })
    document.getElementById("player-list").innerHTML = "<u>Players:</u>"

    //fungerar inte men borde fungera, tar bort rummet om det är tomt
    if (await getUsers(key).length == 0){
        database.ref("rooms/" + key).remove()
    }
    
    toggleElements("room-lobby", "room-prompt");
})

function toggleElements(hide, show) {
    document.getElementById(hide).classList.add("hide");
    document.getElementById(show).classList.remove("hide");
}