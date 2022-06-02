// global variables
// store current task to track edits preserving id and state
var task_being_edited = {};

let timeLeft = (time) => {
    time = Date.parse(time);
    let due = ''
    let delta = Math.abs(time - Date.now()) / 1000;
    let days = Math.floor(delta / 86400);
    if (days > 0) due = `${days}D `
    if (days > 1) return due;
    delta -= days * 86400;
    let hours = Math.floor(delta / 3600) % 24;
    if (hours > 0) due = `${due}${hours}H `
    if (hours > 1) return due
    delta -= hours * 3600;
    let minutes = Math.floor(delta / 60) % 60;
    due = `${due} ${minutes}M`
    return due;
}

// utility functions definitions
let generateID = () => {
    let id = '_' + Math.random().toString(36).slice(2, 9);
    return id;
}
let createTaskObject = (id = null, state = false) => {
    // check if local storage has a task_being_edited..load its id and state
    let task_object = {
        id: task_being_edited.id ? task_being_edited.id : generateID(),
        state: task_being_edited.state ? task_being_edited.state : false,
        title: $('#title')[0].value,
        description: $('#description')[0].value,
        priority: $('#priority')[0].value / 20,
        due: $('#due-date')[0].value,
    }
    $('#title')[0].value = "";
    $('#description')[0].value = "";
    $('#priority')[0].value = 50;
    $('#due-date')[0].value = '';
    return task_object;
}

let createTaskHTMLElement = (task) => {
    const task_element = document.createElement("li");
    task_element.id = task.id;
    if (Date.parse(task.due) - Date.now() < 24 * 3600 * 1000) task_element.classList.add('urgent')
    task_element.innerHTML = `
    <div class="task-text">
        <h4 type="text" class="task-title"><span>(${task.priority}) </span> ${task.title}<span class="task-due-date">${timeLeft(task.due)}</span> </h4 >
    <h6>${task.description}</h6>
    </div >
    <div class="task-edit">
        <input type="checkbox" class="check" id="chk${task.id}" onclick="checkTask(this)" ${task.state ? 'checked' : ''}>
            <i id="edt${task.id}" class="fa fa-pencil"" onclick="editTask(this)"></i>
        <i id="del${task.id}" class=" fa fa-trash"" onclick="removeTask(this)"></i>
    </div > `;
    return task_element;
}

// gets data from localStorage, returns an array of two arrays, one for tasks marked as done, another for tasks not marked
let loadTasksFromStorage = () => {
    let todo_list = [];
    let done_list = [];

    // Get the tasks from localStorage and convert it to an array
    if (localStorage.getItem("tasks") == null) return;
    // Loop through the tasks and add them to the correct list
    let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
    tasks.forEach(task => {
        if (task.state) { done_list.push(task); }
        else { todo_list.push(task); }
    });
    return [todo_list, done_list]
}


// render list to DOM function
let renderLists = (search) => {
    done_items_view.innerHTML = ""
    todo_items_view.innerHTML = ""

    // 1- gets data from localStorage on every render
    let [todo_list, done_list] = loadTasksFromStorage();
    if (search) {
        const regex = new RegExp(search, 'gi');
        todo_list = todo_list.filter((task) => task.description.match(regex) || task.title.match(regex));
        done_list = done_list.filter((task) => task.description.match(regex) || task.title.match(regex));
    }

    // 3 - sort list, give the sorting function to this, but not as a parameter, keep each list sorting separate
    todo_list = todo_list.sort(sorting_functions[localStorage.getItem('todo_sorting')]);
    done_list = done_list.sort(sorting_functions[localStorage.getItem('done_sorting')]);

    // 4- create dom elements, then render to DOM
    todo_list.forEach(task => {
        const li = createTaskHTMLElement(task);
        todo_items_view.insertBefore(li, todo_items_view.children[0]);
    });
    done_list.forEach(task => {
        const li = createTaskHTMLElement(task);
        done_items_view.insertBefore(li, done_items_view.children[0]);
    });
}

function addTask() {
    hideHandler();
    // create task object, add to local storage, call renderLists function
    let new_task = createTaskObject();
    localStorage.setItem("tasks", JSON.stringify([...JSON.parse(localStorage.getItem("tasks") || "[]"), new_task]));
    renderLists();
    task_being_edited = {};
}

function checkTask(element) {
    let targetID = element.id.slice(3);
    // gets localStorage tasks and modifies the element with the id
    let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
    tasks.forEach(task => {
        if (task.id === targetID) {
            task.state = !task.state;
        }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderLists();
}

function removeTask(element) {
    let targetID = element.id.slice(3);
    let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
    tasks.forEach((task, i) => {
        if (task.id === targetID) {
            tasks.splice(i, 1);
        }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderLists();
}

function editTask(element) {
    let targetID = element.id.slice(3);
    let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
    tasks.forEach((task, i) => {
        if (task.id === targetID) {
            // remove target task from local storage and store it global variable
            task_being_edited = tasks.splice(i, 1)[0];
        }
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderLists();
    $('#title')[0].value = task_being_edited.title;
    $('#description')[0].value = task_being_edited.description;
    $('#priority')[0].value = task_being_edited.priority * 20;
    $('#due-date')[0].value = task_being_edited.due;
    revealHandler();
}
// end of utility functions section


// global variables
let sorting_functions = {
    priority: (a, b) => a.priority > b.priority ? 1 : -1,
    due: (a, b) => a.due > b.due ? -1 : 1
}

let search = $('#search');
let todo_items_view = $('#todo-items')[0];
let done_items_view = $('#done-items')[0];

// can show and hide (search / form) depending what the user is interacting with
let search_wrapper = $('#search-wrapper')[0];
let form = $("form")[0];
let reveal = $("#reveal")[0]; //plus button


//event handling functions
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

// adding event listeners
$("#reveal").click(revealHandler);
search.keyup((e) => renderLists(e.target.value));
// On form submit add task
$("form")[0].addEventListener("submit", e => {
    e.preventDefault();
    addTask();
});

// onload, gets data from local storage and renders lists

window.onload = () => {
    localStorage.setItem('todo_sorting', 'priority');
    localStorage.setItem('done_sorting', 'priority');
    renderLists();
}

$('.sort').click((e) => {
    let h3 = e.target.parentNode;
    console.log(h3);
    h3.querySelectorAll('i').forEach(i => i.classList.remove('active'));
    e.target.classList.add('active');
    localStorage.setItem(e.target.dataset.list, e.target.dataset.sort);
    renderLists();
    console.log(e.target.dataset.sort);
});