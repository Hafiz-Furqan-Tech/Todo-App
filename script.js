import {
  auth,
  signOut,
  addDoc,
  collection,
  db,
  query,
  where,
  getDocs,
  onAuthStateChanged,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "./firebase/Firebase.js";

try {
  const loader = document.querySelector(".loader");
  const loadingText = document.querySelector(".loadingText");

  const logout = document.querySelector("#logout");
  const form = document.querySelector("form");
  const taskList = document.querySelector("#task-list");
  const progressBar = document.getElementById("progress");
  const numbers = document.getElementById("numbers");
  const taskInput = form["taskInput"];
  const taskCollection = collection(db, "Tasks");

  let tasks = [];

  onAuthStateChanged(auth, (user) => {
    if (user) {
      getDataFirebase();
    } else {
      loader.style.display = "none";
      loadingText.style.display = "none";
      window.location.href = "./auth/login/login.html";
    }
  });

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  logout.addEventListener("click", handleLogout);
  form.addEventListener("submit", handleAddOrUpdateTask);
  function handleLogout() {
    showToast("Logging out...");
    signOut(auth)
      .then(() => {
        showToast("Logged out successfully");
        setTimeout(() => {
          window.location.href = "./auth/login/login.html";
        }, 2000);
      })
      .catch((error) => {
        console.error("Error during logout: ", error);
        showToast("Error during logout");
      });
  }

  async function handleAddOrUpdateTask(event) {
    event.preventDefault();

    const taskBtn = form["newTask"];
    const taskText = taskInput.value.trim();
    const editId = form.getAttribute("data-edit-id");

    if (taskText === "") return showToast("Please Enter a Task");

    if (editId) {
      taskBtn.disabled = true;
      const taskRef = doc(db, "Tasks", editId);
      await updateDoc(taskRef, {
        text: taskText,
        timeStamp: new Date().toLocaleTimeString(),
      });
      form.removeAttribute("data-edit-id");
      taskBtn.disabled = false;
    } else {
      const user = auth.currentUser;
      if (user) {
        taskBtn.disabled = true;
        showToast("Task Adding");
        await addDoc(taskCollection, {
          text: taskText,
          completed: false,
          uid: user.uid,
          timeStamp: new Date().toLocaleTimeString(),
        });
        showToast("task added");
        taskBtn.disabled = false;
      }
    }

    taskInput.value = "";
    getDataFirebase();
  }

  async function getDataFirebase() {
    const user = auth.currentUser;

    if (user) {
      loader.style.display = "block";
      loadingText.style.display = "block";
      const q = query(
        taskCollection,
        where("uid", "==", user.uid),
        orderBy("timeStamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      tasks = [];
      taskList.innerHTML = "";

      querySnapshot.forEach((doc) => {
        const taskData = doc.data();

        tasks.push({ id: doc.id, ...taskData });

        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div class="taskItem">
              <div class="task ${taskData.completed ? "completed" : ""}">
                <input type="checkbox" class="checkbox" ${
                  taskData.completed ? "checked" : ""
                } />
                <p>${taskData.text}</p>
              </div>
              <div class="img">
                <img src="./images/icons8-edit-26.png" class="editTask" data-id="${
                  doc.id
                }" data-text="${taskData.text}" />
                <img src="./images/icons8-delete-26 (1).png" class="deleteTask" data-id="${
                  doc.id
                }" />
              </div>
            </div>`;
        taskList.appendChild(listItem);
      });

      loader.style.display = "none";
      loadingText.style.display = "none";
      updateStats();
      addEventListenersToTasks();
    }
  }

  function updateStats() {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    progressBar.style.width = `${progress}%`;
    numbers.innerText = `${completedTasks} / ${totalTasks}`;
  }

  function addEventListenersToTasks() {
    const deleteButtons = document.querySelectorAll(".deleteTask");
    const editButtons = document.querySelectorAll(".editTask");
    const checkboxes = document.querySelectorAll(".checkbox");

    deleteButtons.forEach((button) => {
      button.addEventListener("click", (e) => deleteTask(e.target.dataset.id));
    });

    editButtons.forEach((button) => {
      button.addEventListener("click", (e) =>
        editTask(e.target.dataset.id, e.target.dataset.text)
      );
    });

    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener("change", () => toggleTaskComplete(index));
    });
  }

  async function deleteTask(taskId) {
    const taskRef = doc(db, "Tasks", taskId);
    showToast("Task Deleting...");
    await deleteDoc(taskRef);
    getDataFirebase();
    showToast("Task Deleted");
  }

  function editTask(taskId, taskText) {
    taskInput.value = taskText;
    form.setAttribute("data-edit-id", taskId);
    showToast("Editing Task...");
  }

  function toggleTaskComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    const taskRef = doc(db, "Tasks", tasks[index].id);
    updateDoc(taskRef, { completed: tasks[index].completed }).then(() => {
      updateTaskList();
      updateStats();
      showToast(
        tasks[index].completed ? "Task Completed" : "Task Marked Incomplete"
      );
    });
  }

  function updateTaskList() {
    taskList.innerHTML = "";
    tasks.forEach((task, index) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
          <div class="taskItem">
            <div class="task ${task.completed ? "completed" : ""}">
              <input type="checkbox" class="checkbox" ${
                task.completed ? "checked" : ""
              } />
                <p>${task.text}</p>
              </div>
            <div class="img">
              <img src="./images/icons8-edit-26.png" class="editTask" data-id="${
                task.id
              }" data-text="${task.text}" />
              <img src="./images/icons8-delete-26 (1).png" class="deleteTask" data-id="${
                task.id
              }" />
            </div>
          </div>`;

      taskList.appendChild(listItem);
    });
    addEventListenersToTasks();
  }
} catch (error) {
  console.log(error);
}
