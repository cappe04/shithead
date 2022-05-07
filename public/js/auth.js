const nicknameForm = document.querySelector("#nickname-prompt");
const nameDisplay = document.querySelector("#name-display");
const changeName = document.querySelector("#btn-change-name");

firebase.auth().onAuthStateChanged((firebaseUser) => {
    if (!firebaseUser) {
      firebase.auth().signInAnonymously();
    };
});

nicknameForm.addEventListener("submit", async event => {
    event.preventDefault()

    const user = firebase.auth().currentUser;
    await user.updateProfile({displayName: nicknameForm.nickname.value})

    toggleElements("nickname-prompt", "room-prompt");
    nameDisplay.innerHTML = `Name: <strong>${user.displayName}</strong>`;
})

changeName.addEventListener("click", event => {
    toggleElements("room-prompt", "nickname-prompt")
})