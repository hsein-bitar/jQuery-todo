let search = $('#search');
let todo_items_view = $('#todo-items')[0];
let done_items_view = $('#done-items')[0];

// can show and hide (search / form) depending what the user is interacting with
let search_wrapper = $('#search-wrapper')[0];
let form = $("form")[0];
let reveal = $("#reveal")[0]; //plus button

//reveals form to add tasks and hides search bar
let revealHandler = () => {
    search_wrapper.classList.add('none');
    form.classList.remove('none')
}
//hides form to add tasks, and shows search bar
let hideHandler = () => {
    search_wrapper.classList.remove('none');
    form.classList.add('none')
}

// TODO // filters tasks when there is input in search bar
let searchHandler = (e) => {
    console.log(e.target.value);
    for (let i = 0; i < todo_items_view.length; i++) {
        console.log(todo_items_view[i]);
    }
}

let generateID = () => {
    let id = '_' + Math.random().toString(36).slice(2, 9);
    return id;
}


console.log(reveal);
// console.log(reveal2);
$("#reveal").click(revealHandler);
search.keyup(searchHandler);


// On app load, get all tasks from localStorage
// window.onload = loadFromLocalStorage;

// On form submit add task
$("form")[0].addEventListener("submit", e => {
    e.preventDefault();
    addTask();
});

function loadFromLocalStorage() {
    // if local storage empty, break
    if (localStorage.getItem("tasks") == null) return;
    // Get the tasks from localStorage and convert it to an array
    let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
    // TODO sort default then append
    // Loop through the tasks and add them to the list
    tasks.forEach(task => {
        const li = document.createElement("li");
        li.innerHTML = `<input type="checkbox" onclick="checkTask(this)" class="check" ${task.completed ? 'checked' : ''}>
        <input type="text" value="${task.task}" class="task ${task.completed ? 'completed' : ''}" onfocus="getCurrentTask(this)" onblur="editTask(this)">
            <i class="fa fa-trash" onclick="removeTask(this)"></i>`;
        if (task.completed) {
            done_items_view.insertBefore(li, done_items_view.children[0]);
        } else {
            todo_items_view.insertBefore(li, todo_items_view.children[0]);
        }
    });
}

function addTask(id, state) {
    hideHandler();
    let newTask = {
        id: id ? id : generateID(),
        title: $('#title')[0].value,
        completed: state ? state : false,
        description: $('#description')[0].value,
        priority: $('#priority')[0].value / 20,
        due: $('#due-date')[0].value,
    }
    $('#title')[0].value = ""
    $('#description')[0].value = ""
    $('#priority')[0].value = 50;
    console.log(newTask);

    // create list item, add innerHTML and append to ul
    const li = document.createElement("li");
    li.id = newTask.id;
    li.innerHTML = `
        <div class="task-text">
            <h4 type="text" class="task-title"><span>(${newTask.priority}) </span> ${newTask.title} <span class="task-due-date">(${newTask.due}) </span></h4>
            <h6>${newTask.description}</h6>
        </div>
        <div class="task-edit">
            <input type="checkbox" class="check" id="chk${newTask.id}" onclick="checkTask(this)" ${newTask.completed ? 'checked' : ''}>
            <i id="edt${newTask.id}" class="fa fa-pencil""></i>
            <i id="del${newTask.id}" class=" fa fa-trash""></i>
        </div>`;
    localStorage.setItem("tasks", JSON.stringify([...JSON.parse(localStorage.getItem("tasks") || "[]"), newTask]));
    if (state) {
        done_items_view.insertBefore(li, todo_items_view.children[0]);
    } else {
        todo_items_view.insertBefore(li, todo_items_view.children[0]);
    }
    newTask.value = "";
}

function checkTask(event) {
    let targetID = event.id.slice(3);
    let li = $(`#${targetID}`)[0];
    // remove from parent list
    li.parentElement.removeChild(li);
    if (event.checked) {
        // put into done list
        done_items_view.insertBefore(li, todo_items_view.children[0]);
    } else {
        // put into todo list
        todo_items_view.insertBefore(li, todo_items_view.children[0]);
    }
    //make sure the task is updated in local storage as well, so refreshing does not ruin things
    let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
    tasks.forEach(task => {
        if (task.id === targetID) {
            task.completed = !task.completed;
        }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// TODO not working not removing
function removeTask(event) {
    let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
    tasks.forEach(task => {
        if (task.id === event.parentNode.children[1].id) {
            // delete task
            tasks.splice(tasks.indexOf(task), 1);
        }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    event.parentElement.remove();
}

// store current task to track changes
var currentTask = null;

// get current task
function getCurrentTask(event) {
    currentTask = event.value;
}
// TODO add edit listener
// TODO remove from local storage??
// edit the task and update local storage
function editTask(event) {
    revealHandler();
    let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
    // check if task is empty
    if (event.value === "") {
        alert("Task is empty!");
        event.value = currentTask;
        return;
    }
    // task already exist
    tasks.forEach(task => {
        if (task.task === event.value) {
            alert("Task already exist!");
            event.value = currentTask;
            return;
        }
    });
    // update task
    tasks.forEach(task => {
        if (task.task === currentTask) {
            task.task = event.value;
        }
    });
    // update local storage
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
