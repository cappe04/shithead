// Byter synligheten av två element
function toggleElements(hide, show) {
    document.getElementById(hide).classList.add("hide");
    document.getElementById(show).classList.remove("hide");
}

async function getSnapshot(path, callback) {
    let value;
    await database.ref(path).once("value").then(function (snapshot) {
        value = callback(snapshot);
    });
    return value;
};

async function getUsers(key) { // ändra så att {snapshot.key : snapshot.toJSON()} returneras. behöver dock ändras på alla andra ställen i koden
    return getSnapshot("rooms/" + key + "/users", (snapshot) =>
        snapshot.toJSON()
    );
};

// Om en användare är i rummet
let userInRoom = async function (user, key) {
    let users = await getUsers(key);
    return Object.keys(users).includes(user)
};

// Gå med i ett rum
let joinRoom = function (key, user) {
    let branch = database.ref("rooms/" + key + "/users/" + user.uid);
    branch.set(userPackage(user))

    database.ref("rooms").on("child_removed", (snapshot) => {
        if(snapshot.key == key){
            exitRoom()
        }
    })
    
    console.log("Joined room: " + key);
    roomKey = key
    enterRoom(key);
};

// Packetering användar informationen
let userPackage = function (user) {
    return {
        name: user.displayName,
        hand: false, //kan inte vara {} för childen tas bort. så .validate fungerar inte
        viscards: false,
        hidcards: false
    };
};

// Skapa en nyckel till rummet
let generateKey = async function () {
    let key = Math.random().toString(36).slice(2, 6);
    return (await roomExists(key)) ? generateKey() : key;
};

// Kolla om rummet redan finns
let roomExists = async function (key) { // skriv om med getSnapshot
    let exists;
    await database.ref("rooms/" + key).once("value").then(function (snapshot) {
        exists = snapshot.exists();
    });
    return exists;
};

// Skicka meddelande till databasen
function sendMessage(key, message){
    const user = firebase.auth().currentUser
    const chat = database.ref("rooms/" + key + "/chat/" + Date.now())
    let package = {
        "uid": user.uid,
        "name": user.displayName,
        "message": message
    }
    chat.set(package)
}

// Ta bort en användare från rummet
async function removeUserFromRoom(key, nickname) {
    let owner = await getSnapshot("rooms/" + key + "/room-info",(snapshot) => {
        return snapshot.toJSON().owner;
    });
    const user = firebase.auth().currentUser

    if (owner == user.uid) {
        getSnapshot("rooms/" + key + "/users", function (snapshot) {
            snapshot.forEach(function (child) {
                let usr = child.toJSON();
                if (usr.name == nickname && child.key != user.uid) {
                    child.ref.remove();
                }
            });
        });
    } else {
        console.log("You don't have premission to do that!");
    }
}
