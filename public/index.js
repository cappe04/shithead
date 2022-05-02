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
    console.log(user)
})

document.getElementById("btn-enter-username").addEventListener("click", e => {
    user.nickname = document.getElementById("entry-nickname").value;
    toggleElements("nickname-prompt", "room-prompt")
    document.getElementById("name-display").innerHTML = `Your name is now ${user.nickname}, click the button below if you want to change it.`
    console.log(user)
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
    let users = []
    await getSnapshot("rooms/" + key + "/users", (snapshot) => {
        snapshot.forEach(function(childSnapshot){
            users.push(childSnapshot.toJSON())
        })
    })
    return users
}

let joinRoom = function (key, user) {
    let branch = database.ref("rooms/" + key);
    branch.child("users").push(userPackage(user));
    console.log("Joined room: " + key)
    enterRoom(key)
}

let enterRoom = async function(key){
    toggleElements("room-prompt", "room-lobby");

    document.getElementById("room-display").innerHTML = "room: " + key

    const fetch_users = database.ref("rooms/" + key + "/users")
    let playerList = document.getElementById("player-list")
    let roomInfo = getSnapshot("rooms/" + key + "room-info", (snapshot) => {return snapshot.toJSON()})
    let users = await getUsers(key)

    fetch_users.on("child_added", function(snapshot){
        let u = snapshot.toJSON()
        playerList.innerHTML += `<li class=${u.uid == user.uid ? "list-self": "list-user"}>${u.name}</li>`
    })

    document.documentElement.style.setProperty("--user-crossed", roomInfo.owner == user.uid ? "line-through" : "normal")

}

let ri = function() {
    let func = function(snapshot){
        return snapshot.toJSON()
    }
    return getSnapshot("rooms/js9n/room-info", func)
}

let getUniqueId = async function (key, user) {
    await database.ref("rooms/" + key + "/users").once("value").then(function(snapshot) {
        console.log("1")
        snapshot.forEach(function(childSnapshot) {
            console.log("2")
            if (childSnapshot.child("uid").val() == user.uid) {
                console.log("3")
            }
        })
    })
}

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

document.getElementById("btn-join-room").addEventListener("click", async function (){
    let key = document.getElementById("room-key-entry").value
    await roomExists(key)
    if (await roomExists(key)){
        if (!userInRoom(user, key)) {
            joinRoom(key, user)
            document.getElementById("room-display").innerText = `You are now in room ${key}.`
        } else {
            enterRoom(key)
        }
    } else {
        console.log("Room doesn't exist")
    }
})

document.getElementById("btn-leave-room").addEventListener("click", async function () {
    let key = document.getElementById("room-display").value;
    let uniqueId = await getUniqueId(key, user);
    database.ref("rooms/" + key + "/users").child(uniqueId).remove();
    toggleElements("room-lobby", "room-prompt");
})

function toggleElements(hide, show) {
    document.getElementById(hide).classList.add("hide");
    document.getElementById(show).classList.remove("hide");
}