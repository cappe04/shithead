// Initiering av firebase

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

var roomKey = null;

window.onbeforeunload = async function(){

    if(roomKey != null){
        const user = firebase.auth().currentUser;

        let roomInfo = await getSnapshot("rooms/" + roomKey + "/room-info", (snapshot) => {
            return snapshot.toJSON();
        })

        if(user.uid == roomInfo.owner){
            database.ref("rooms/" + roomKey).remove()
        } else {
            database.ref("rooms/" + roomKey + "/users/" + user.uid).remove()
        }
    }

}

