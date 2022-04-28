
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

const firebase_database = firebase.database()

const username = prompt("Nickname: ")

document.getElementById("message-form").addEventListener("submit", sendMessage);

function sendMessage(event){
    const timestamp = Date.now();
    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;

    messageInput.value = "";

    // skapar firebase database collection och sickar data
    firebase_database.ref("messages/" + timestamp).set({
        username,
        message
    })
}

const fetch_chat = firebase_database.ref("messages/")

// child_added triggras varje gång firebase_database.ref().set kallas
fetch_chat.on("child_added", function (snapshot) {
    const messages = snapshot.val();
    const message = `<li class=${
        username === messages.username ? "sent" : "receive"
    }><span>${messages.username}: </span>${messages.message}</li>`;

    document.getElementById("messages").innerHTML += message
})