import {
  db,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  auth,
} from "./firebase/Firebase.js";

// Local tasks array to manage state
let tasks = [];
let editingTaskId = null;

// Fetch tasks for logged-in user
const fetchTasksFromFirebase = async () => {
  const user = auth.currentUser;
  if (user) {
    const q = query(collection(db, "Tasks"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    tasks = []; // Empty the array before refilling
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    updateTaskList();
    updateStats();
  }
};

// Add new task
const addTask = async () => {
  const taskInput = document.getElementById("taskInput");
  const text = taskInput.value.trim();
  const user = auth.currentUser;

  if (text && user) {
    if (editingTaskId) {
      await updateTaskFirebase(editingTaskId, text);
    } else {
      await addTaskFirebase(text, user.uid);
    }
    taskInput.value = ""; // Clear the input field
    editingTaskId = null; // Reset after editing
  }
  updateTaskList();
  updateStats();
};

// Add task to Firestore with user ID
async function addTaskFirebase(text, uid) {
  try {
    const docRef = await addDoc(collection(db, "Tasks"), {
      text: text,
      completed: false,
      uid: uid, // Store user ID with task
    });
    tasks.push({ id: docRef.id, text: text, completed: false });
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// Update task in Firestore (for editing)
async function updateTaskFirebase(id, text) {
  try {
    const taskRef = doc(db, "Tasks", id);
    await updateDoc(taskRef, { text: text });
    tasks = tasks.map((task) => (task.id === id ? { ...task, text } : task));
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

// Delete task from Firestore and local state
const deleteTask = async (id) => {
  try {
    await deleteDoc(doc(db, "Tasks", id));
    tasks = tasks.filter((task) => task.id !== id);
    updateTaskList();
    updateStats();
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
};

// Toggle task completion and update Firestore
const toggleTaskComplete = async (index) => {
  tasks[index].completed = !tasks[index].completed;
  const taskRef = doc(db, "Tasks", tasks[index].id);
  await updateDoc(taskRef, { completed: tasks[index].completed });
  updateTaskList();
  updateStats();
};

// Edit task (load into input field without removing from list)
const editTask = (index) => {
  const taskInput = document.getElementById("taskInput");
  taskInput.value = tasks[index].text;
  editingTaskId = tasks[index].id; // Set editing task ID
};

// Update Stats (Progress Bar and Numbers)
const updateStats = () => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const progressBar = document.getElementById("progress");

  progressBar.style.width = `${progress}%`;
  document.getElementById(
    "numbers"
  ).innerText = `${completedTasks} / ${totalTasks}`;
};

// Update Task List in UI
// Update Task List in UI
const updateTaskList = () => {
  const taskList = document.getElementById("task-list");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <div class="taskItem">
        <div class="task ${task.completed ? "completed" : ""}">
          <input type="checkbox" class="checkbox" ${
            task.completed ? "checked" : ""
          }/>
          <p>${task.text}</p>
        </div>
        <div class="icons">
          <img src="./images/icons8-edit-26.png" class="editTask" />
          <img src="images/icons8-delete-26 (1).png" class="deleteTask" />
        </div>
      </div>`;

    // Append the list item to the task list
    taskList.appendChild(listItem);

    // Add event listeners for edit and delete icons
    listItem
      .querySelector(".editTask")
      .addEventListener("click", () => editTask(index));
    listItem
      .querySelector(".deleteTask")
      .addEventListener("click", () => deleteTask(task.id));
    listItem
      .querySelector(".checkbox")
      .addEventListener("change", () => toggleTaskComplete(index));
  });
};

// Add Task on Submit
document.getElementById("newTask").addEventListener("click", function (e) {
  e.preventDefault();
  addTask();
});

// Fetch tasks when the page loads
auth.onAuthStateChanged((user) => {
  if (user) {
    fetchTasksFromFirebase();
  }
});
