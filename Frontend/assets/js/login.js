// ================= TOGGLE =================
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

// ================= LOGIN =================
loginForm.onsubmit = e => {
  e.preventDefault();

  const selectedRole = loginRole.value;

  auth
    .signInWithEmailAndPassword(loginEmail.value, loginPassword.value)
    .then(userCredential => {
      const uid = userCredential.user.uid;

      // Check role from Firestore
      db.collection("users")
        .doc(uid)
        .get()
        .then(doc => {
          if (!doc.exists) {
            alert("No role assigned. Contact admin.");
            auth.signOut();
            return;
          }

          const userRole = doc.data().role;

          // Role mismatch protection
          if (userRole !== selectedRole) {
            alert("Role mismatch! Please select correct role.");
            auth.signOut();
            return;
          }

          // Redirect based on role
          if (userRole === "admin") {
            location.href = "admin-dashboard.html";
          } else {
            location.href = "user-dashboard.html";
          }
        });
    })
    .catch(err => alert(err.message));
};

// ================= SIGNUP =================
signupForm.onsubmit = e => {
  e.preventDefault();

  if (signupPassword.value !== signupConfirm.value)
    return alert("Passwords do not match");

  const selectedRole = signupRole.value;

  auth
    .createUserWithEmailAndPassword(signupEmail.value, signupPassword.value)
    .then(userCredential => {
      const uid = userCredential.user.uid;

      // Save role in Firestore
      db.collection("users")
        .doc(uid)
        .set({
          email: signupEmail.value,
          role: selectedRole,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          // Redirect based on role
          if (selectedRole === "admin") {
            location.href = "dashboard.html";
          } else {
            location.href = "home.html";
          }
        });
    })
    .catch(err => alert(err.message));
};

// ================= GOOGLE SIGN-IN =================
googleSignIn.onclick = () => {
  auth
    .signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(result => {
      const user = result.user;

      // Default role = user if first time Google login
      db.collection("users")
        .doc(user.uid)
        .get()
        .then(doc => {
          if (!doc.exists) {
            // Create new user with default role
            db.collection("users").doc(user.uid).set({
              email: user.email,
              role: "user",
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          }

          location.href = "home.html";
        });
    })
    .catch(err => alert(err.message));
};

// ================= RESET PASSWORD =================
forgotPassword.onclick = e => {
  e.preventDefault();

  if (!loginEmail.value) return alert("Enter email");

  auth
    .sendPasswordResetEmail(loginEmail.value)
    .then(() => alert("Reset link sent"))
    .catch(err => alert(err.message));
};