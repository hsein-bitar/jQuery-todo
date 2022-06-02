// utility functions
let generateID = () => {
    let id = '_' + Math.random().toString(36).slice(2, 9);
    return id;
}

let createTaskObject = (id = null, state = false) => {
    let task_object = {
        id: id ? id : generateID(),
        state: state ? state : false,
        title: $('#title')[0].value,
        description: $('#description')[0].value,
        priority: $('#priority')[0].value / 20,
        due: $('#due-date')[0].value,
    }
    $('#title')[0].value = "";
    $('#description')[0].value = "";
    $('#priority')[0].value = 50;
    $('#due-date')[0].value = '2022-05-05';
    return task_object;
}

let createTaskHTMLElement = (task) => {
    const task_element = document.createElement("li");
    task_element.id = task.id;
    task_element.innerHTML = `
    <div class="task-text">
        <h4 type="text" class="task-title"><span>(${task.priority}) </span> ${task.title} <span class="task-due-date">(${task.due}) </span></h4>
        <h6>${task.description}</h6>
    </div>
    <div class="task-edit">
        <input type="checkbox" class="check" id="chk${task.id}" onclick="checkTask(this)" ${task.completed ? 'checked' : ''}>
        <i id="edt${task.id}" class="fa fa-pencil""></i>
        <i id="del${task.id}" class=" fa fa-trash""></i>
    </div>`;
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

// end of utility functions section


// store sorting config maybe in local storage
let todo_list_sorting = 0;
let done_list_sorting = 0;


// TODO main functions
// add task:
// 1- gets input data
// 2- generates an id if new task, creates a task object
// 3- modifies localStorage to include the new task
// 4- calls the render function only on the relevant list


// onload:
// loadTasksFromStorage
// render(list 1), list 2


// render list to DOM function
let renderLists = (list, search, sortingFunction) => {

    // 1- gets data from localStorage on every render
    let [todo_list, done_list] = loadTasksFromStorage();

    // 2 -filter lists according to search
    if (search) {
        search = '/' + search + '/gi';
        todo_list = todo_list.filter((task) => task.description.match(search) || task.title.match(search));
        done_list = done_list.filter((task) => task.description.match(search) || task.title.match(search));
    }

    // 3 - sort list // TODO give the sorting function to this instead
    todo_list = todo_list.sort((a, b) => a.priority > b.priority ? -1 : 1);
    done_list = done_list.sort((a, b) => a.priority > b.priority ? -1 : 1);
    console.log(todo_list, done_list);

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
// takes one of the two lists, a search string, 
// 
// 2- gets config of each list, and sorts these arrays 
// 3- calls the render function on each array



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
        const li = createTaskHTMLElement(task);
        if (task.completed) {
            done_items_view.insertBefore(li, done_items_view.children[0]);
        } else {
            todo_items_view.insertBefore(li, todo_items_view.children[0]);
        }
    });
}

function addTask(id, state) {
    hideHandler();
    let new_task = createTaskObject();
    console.log(new_task);

    // TODO call a general function that re-renders from local storage until the DOM
    const li = createTaskHTMLElement(new_task);
    console.log(li);
    localStorage.setItem("tasks", JSON.stringify([...JSON.parse(localStorage.getItem("tasks") || "[]"), new_task]));
    if (state) {
        done_items_view.insertBefore(li, todo_items_view.children[0]);
    } else {
        todo_items_view.insertBefore(li, todo_items_view.children[0]);
    }
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
    // store the id and the state somewhere,
    // then give those to the addTask function

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
