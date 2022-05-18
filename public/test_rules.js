const firebaseConfig = {
    apiKey: "AIzaSyCeIhmX88wai4cphbcH2_ZTifGV636XkQ0",
    authDomain: "shithead-fda25.firebaseapp.com",
    databaseURL: "https://shithead-fda25-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "shithead-fda25",
    storageBucket: "shithead-fda25.appspot.com",
    messagingSenderId: "335043860876",
    appId: "1:335043860876:web:a9e7e4a842ea3bcfb6dea9",
    measurementId: "G-50K3MBX143",
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (!firebaseUser) {
      firebase.auth().signInAnonymously();
    };
    joinRoom("4ysn", firebase.auth().currentUser)
    console.log("bad")
});

let generateKey = async function () {
    let key = Math.random().toString(36).slice(2, 6);
    return (await roomExists(key)) ? generateKey() : key;
};

let userPackage = function (user) {
    return {
        name: user.nameDisplay,
        hand: {},
    };
};

let roomExists = async function (key) {
    let exists;
    await database.ref("rooms/" + key).once("value").then(function (snapshot) {
        exists = snapshot.exists();
    });
    return exists;
};

let create = async function(){
    const key = await generateKey();
    const branch = database.ref("rooms/" + key);
    const user = firebase.auth().currentUser;
    let package = {
        "room-info": {
            created: Date.now(),
            owner: user.uid,
            playing: false
        },
    };
    branch.set(package)
}

let joinRoom = function (key, user) {
    let branch = database.ref("rooms/" + key + "/users/" + user.uid);
    user.nameDisplay = "bad"
    console.log(userPackage(user))
    
    branch.set(userPackage(user))
    
    console.log("Joined room: " + key);
}

// {
//     "name": "bad",
//     "hand": {}
// }


