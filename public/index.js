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
    document.getElementById("nickname-prompt").classList.add("hide")
    document.getElementById("room-prompt").classList.remove("hide")
    document.getElementById("name-display").innerHTML = `Your name is now ${user.nickname}, click the button below if you want to change it.`
    console.log(user)
});

document.getElementById("btn-change-name").addEventListener("click", e => {
    document.getElementById("nickname-prompt").classList.remove("hide")
    document.getElementById("room-prompt").classList.add("hide")
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

let userPackage = function(user){
    return {
        name: user.nickname,
        uid: user.uid
    }
}

let userInRoom = async function (user, key) {
    let inRoom = false;
    await database.ref("rooms/" + key + "/users").once("value").then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            // console.log(childSnapshot.child("uid").val())
            // console.log(user.uid)
            if (childSnapshot.child("uid").val() == user.uid) {
                inRoom = true;
            }
        })
    })
    return inRoom;
}

document.getElementById("btn-create-room").addEventListener("click", async function() {
    let key = await generateKey()
    let branch = database.ref("rooms/" + key)
    let package = {
        "users": [],
        "room-info": {
            created: Date.now()
        }
    }
    branch.set(package)
    branch.child("users").push(userPackage(user))
    console.log("Created room: " + key)
})

document.getElementById("btn-join-room").addEventListener("click", async function (){
    let key = document.getElementById("room-key-entry").value
    await roomExists(key)
    if (await roomExists(key)){
        if (!userInRoom(user, key)) {
            let room = database.ref("rooms/" + key)
            room.child("users").push(userPackage(user))
            console.log("joined room: " + key)
        } else {
            console.log("User already in room")
        }
    } else {
        console.log("Room doesn't exist")
    }
})
