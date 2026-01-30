const firebaseConfig = {
  apiKey: "AIzaSyBnkyA0pzhjubkvrmgr52UAULvP7zGh2T4",
  authDomain: "driveon-da2f6.firebaseapp.com",
  projectId: "driveon-da2f6",
  storageBucket: "driveon-da2f6.firebasestorage.app",
  messagingSenderId: "394286318024",
  appId: "1:394286318024:web:ac5a607be3309b44ea40fd",
  measurementId: "G-0CCV8DTEEK"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Toggle
showSignup.onclick = () => {
  signupSection.classList.remove("hidden");
  loginSection.classList.add("hidden");
  showSignup.classList.add("bg-white/20");
  showLogin.classList.remove("bg-white/20");
};

showLogin.onclick = () => {
  loginSection.classList.remove("hidden");
  signupSection.classList.add("hidden");
  showLogin.classList.add("bg-white/20");
  showSignup.classList.remove("bg-white/20");
};

// Login
loginForm.onsubmit = e => {
  e.preventDefault();
  auth.signInWithEmailAndPassword(loginEmail.value, loginPassword.value)
    .then(() => location.href = "dashboard.html")
    .catch(err => alert(err.message));
};

// Signup
signupForm.onsubmit = e => {
  e.preventDefault();
  if (signupPassword.value !== signupConfirm.value)
    return alert("Passwords do not match");
  auth.createUserWithEmailAndPassword(signupEmail.value, signupPassword.value)
    .then(() => location.href = "dashboard.html")
    .catch(err => alert(err.message));
};

// Google
googleSignIn.onclick = () => {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(() => location.href = "dashboard.html")
    .catch(err => alert(err.message));
};

// Reset
forgotPassword.onclick = e => {
  e.preventDefault();
  if (!loginEmail.value) return alert("Enter email");
  auth.sendPasswordResetEmail(loginEmail.value)
    .then(() => alert("Reset link sent"))
    .catch(err => alert(err.message));
};