import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCeSamEcUR_yFl6CIR1KzY_e6cSfrs3CXo",
  authDomain: "todo-app-fb0ab.firebaseapp.com",
  projectId: "todo-app-fb0ab",
  storageBucket: "todo-app-fb0ab.appspot.com",
  messagingSenderId: "317275054949",
  appId: "1:317275054949:web:6f39f5ed61c2f69dd4f78c",
  measurementId: "G-YP8470HZY4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  db,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  signOut,
  setDoc,
  onAuthStateChanged,
  updateDoc,
  deleteDoc,
  orderBy,
};
