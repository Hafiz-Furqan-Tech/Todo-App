import {
  auth,
  createUserWithEmailAndPassword,
  db,
  collection,
  addDoc,
} from "../../firebase/Firebase.js";

const form = document.querySelector("#form");
const btn = document.querySelector("button");
const error_msg = document.querySelector("#error-msg");

const validateForm = () => {
  let isValid = true;

  if (email.value.trim() === "") {
    error_msg.innerText = "Please fill out this field";
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    error_msg.innerText = "Invalid Email";
    isValid = false;
  } else if (password.value.trim() === "") {
    error_msg.innerText = "Please fill out this field";
    isValid = false;
  } else if (password.value.length < 6) {
    error_msg.innerText = "Password must be at least 6 characters";
    isValid = false;
  }

  return isValid;
};

try {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      btn.innerText = "Submit";
      btn.disabled = false;
      return;
    }

    btn.disabled = true;
    btn.innerText = "Please wait...";
    const email = form["email"].value;
    const password = form["password"].value;
    const fName = form["first-name"].value;
    const lName = form["last-name"].value;

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        try {
          await addDoc(collection(db, "users"), {
            uid: user.uid,
            fName: fName,
            lName: lName,
            email: email,
            timestamp: new Date(),
          });
        } catch (error) {
          console.log("Error adding document: ", error);
        }
        btn.innerText = "Sign Up";
        btn.disabled = false;
        window.location.href = "../login/login.html";
      })
      .catch((error) => {
        error_msg.innerText = error.message;
        btn.innerText = "Sign Up";
        btn.disabled = false;
      });
  });
} catch (error) {
  console.log(error);
}
