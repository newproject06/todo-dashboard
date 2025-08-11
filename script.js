let tasks = [];
let reminders = [];

const TASKS_KEY = 'tasks';
const REMINDERS_KEY = 'reminders';

// Load tasks and reminders from localStorage when the page loads
function loadFromLocalStorage() {
  const storedTasks = localStorage.getItem(TASKS_KEY);
  const storedReminders = localStorage.getItem(REMINDERS_KEY);

  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  }

  if (storedReminders) {
    reminders = JSON.parse(storedReminders);
  }
}

// Save tasks and reminders to localStorage
function saveToLocalStorage() {
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

function addTask() {
  const input = document.getElementById('taskInput');
  const text = input.value.trim();
  if (text === '') return;

  const task = {
    id: Date.now(),
    text,
    completed: false
  };

  tasks.push(task);
  input.value = '';
  saveToLocalStorage();
  renderTasks(currentTab);
}

function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveToLocalStorage();
  renderTasks(currentTab);
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveToLocalStorage();
  renderTasks(currentTab);
}

function addReminder() {
  const text = document.getElementById('reminderInput').value.trim();
  const time = document.getElementById('reminderTime').value;

  if (!text || !time) return;

  const reminder = {
    id: Date.now(),
    text,
    time
  };

  reminders.push(reminder);
  document.getElementById('reminderInput').value = '';
  document.getElementById('reminderTime').value = '';
  saveToLocalStorage();
  renderTasks(currentTab);

  // Schedule notification check
  scheduleReminderNotification(reminder);
}

// Schedule the reminder notification using setTimeout
function scheduleReminderNotification(reminder) {
  const reminderTime = new Date(reminder.time).getTime();
  const currentTime = new Date().getTime();

  // If the reminder time is in the future, schedule the notification
  if (reminderTime > currentTime) {
    const timeDifference = reminderTime - currentTime;

    setTimeout(() => {
      showNotification(reminder.text);
    }, timeDifference);
  }
}

// Display a notification
function showNotification(reminderText) {
  if (Notification.permission === "granted") {
    new Notification("Reminder", {
      body: reminderText,
      icon: "https://via.placeholder.com/100",
    });
  } else {
    console.log("Notification permission not granted.");
  }
}

function deleteReminder(id) {
  reminders = reminders.filter(r => r.id !== id);
  saveToLocalStorage();
  renderTasks('reminders');
}

let currentTab = 'all';

function renderTasks(filter = 'all') {
  currentTab = filter;

  const taskList = document.getElementById('taskList');
  const reminderList = document.getElementById('reminderList');

  // Show/hide task/reminder lists
  taskList.style.display = (filter === 'reminders') ? 'none' : 'block';
  reminderList.style.display = (filter === 'reminders') ? 'block' : 'none';

  document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
  document.getElementById(`nav-${filter}`).classList.add('active');

  if (filter === 'reminders') {
    reminderList.innerHTML = '';

    if (reminders.length === 0) {
      reminderList.innerHTML = `<p style="color: #888;">No reminders set.</p>`;
      return;
    }

    reminders.forEach(reminder => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <strong>${reminder.text}</strong><br/>
          <small>⏰ ${new Date(reminder.time).toLocaleString()}</small>
        </div>
        <div class="actions">
          <button class="delete" onclick="deleteReminder(${reminder.id})">✖</button>
        </div>
      `;
      reminderList.appendChild(li);
    });

    return;
  }

  // Task Rendering Logic (same as before)
  let filtered = tasks;
  if (filter === 'pending') filtered = tasks.filter(t => !t.completed);
  if (filter === 'completed') filtered = tasks.filter(t => t.completed);

  if (filtered.length === 0) {
    taskList.innerHTML = `<p style="color: #888;">No tasks in this section.</p>`;
    return;
  }

  taskList.innerHTML = '';

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.classList.toggle('completed', task.completed);

    li.innerHTML = `
      <span>${task.text}</span>
      <div class="actions">
        <button class="complete" onclick="toggleComplete(${task.id})">✔</button>
        <button class="delete" onclick="deleteTask(${task.id})">✖</button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

function showTab(tabName) {
  renderTasks(tabName);
}

// Initial render and load from localStorage
loadFromLocalStorage();
renderTasks();

// Ask for notification permission when the page loads
if (Notification.permission !== "granted") {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
    } else {
      console.log("Notification permission denied.");
    }
  });
}
