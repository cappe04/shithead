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

let user;

document.getElementById("btn-enter-username").addEventListener("click", e => {
    firebase.auth().signInAnonymously();
});

firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        firebaseUser.nickname = document.getElementById("entry-nickname").value;
        document.getElementById("nickname-prompt").classList.add("hide")
        document.getElementById("room-prompt").classList.remove("hide")
    }
    user = firebaseUser
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

document.getElementById("create-room-button").addEventListener("click", async function() {
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

    console.log(key)
})



document.getElementById("join-room-button").addEventListener("click", async function (){
    let key = document.getElementById("room-key-entry").value
    await roomExists(key).then(console.log)
    if (await roomExists(key)){
        let room = database.ref("rooms/" + key)
        room.child("users").push(userPackage(user))
        console.log("joined room: " + key)
    } else {
        console.log("liar, liar, pants on fire!")
    }
})
