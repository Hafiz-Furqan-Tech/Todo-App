import { auth, signInWithEmailAndPassword } from "../../firebase/Firebase.js";

const form = document.querySelector("form");
const btn = document.querySelector("button");
const error_msg = document.querySelector("#error-msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  btn.innerText = "Please wait...";

  const email = form["email"].value;
  const password = form["password"].value;
 
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      window.location.href = "../../index.html";
      btn.innerText = "Login";
    })
    .catch((error) => {
      console.log(error.code);

      btn.innerText = "Login";
      if (email.trim() === "" || password.trim() === "") {
        error_msg.innerText = "Please fill out all fields";
        btn.innerText = "Login";
        btn.disabled = false;
        return;
      }

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          window.location.href = "../../index.html";
        })
        .catch((error) => {
          let errorMessage;
          switch (error.code) {
            case "auth/invalid-email":
              errorMessage = "Invalid Email";
              break;
            case "auth/user-not-found":
              errorMessage = "User not found";
              break;
            case "auth/wrong-password":
              errorMessage = "Wrong password";
              break;
            case "auth/invalid-credential":
              errorMessage = "Email Does not Exist Enter correct password or email";
              break;
            default:
              errorMessage = "An error occurred. Please try again.";
          }
          error_msg.innerText = errorMessage;
          btn.innerText = "Submit";
          btn.disabled = false;
        });
    });
});
