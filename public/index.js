

const firebaseConfig = {
  apiKey: "AIzaSyAHOw3VkBKPEJDdMbTD3kaeTXagT9-cLfQ",
  authDomain: "chat-demo-eb1b8.firebaseapp.com",
  databaseURL: "https://chat-demo-eb1b8-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chat-demo-eb1b8",
  storageBucket: "chat-demo-eb1b8.appspot.com",
  messagingSenderId: "638159569583",
  appId: "1:638159569583:web:4655211de47e9047708a5a",
  measurementId: "G-V1D32D7QV6"
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

// child added triggras varje gång firebase_database.ref().set kallas
fetch_chat.on("child_added", function (snapshot) {
    const messages = snapshot.val();
    const message = `<li class=${
        username === messages.username ? "sent" : "receive"
    }><span>${messages.username}: </span>${messages.message}</li>`;

    document.getElementById("messages").innerHTML += message
})