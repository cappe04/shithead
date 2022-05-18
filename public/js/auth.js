const nicknameForm = document.querySelector("#nickname-prompt");
const nameDisplay = document.querySelector("#name-display");
const changeName = document.querySelector("#btn-change-name");

// Gör en användare om enheten inte är autentiserad
firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (!firebaseUser) {
      firebase.auth().signInAnonymously();
    };
});

// Tillåter användaren att ange ett namn
nicknameForm.addEventListener("submit", async event => {
    event.preventDefault()

    const user = firebase.auth().currentUser;
    await user.updateProfile({displayName: nicknameForm.nickname.value})

    toggleElements("nickname-prompt", "room-prompt");
    nameDisplay.innerHTML = `Name: <strong>${user.displayName}</strong>`;
})

// Möjligheten att gå tillbaka och ändra namn
changeName.addEventListener("click", event => {
    toggleElements("room-prompt", "nickname-prompt")
})