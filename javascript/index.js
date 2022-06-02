// utility functions definitions
let generateID = () => {
    let id = '_' + Math.random().toString(36).slice(2, 9);
    return id;
}
let createTaskObject = (id = null, state = false) => {
    // TODO check if local storage has a task_being_edited..load its id and state
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
    $('#due-date')[0].value = '';
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
        <input type="checkbox" class="check" id="chk${task.id}" onclick="checkTask(this)" ${task.state ? 'checked' : ''}>
        <i id="edt${task.id}" class="fa fa-pencil""></i>
        <i id="del${task.id}" class=" fa fa-trash"" onclick="removeTask(this)"></i>
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


// render list to DOM function
let renderLists = (search) => {
    done_items_view.innerHTML = ""
    todo_items_view.innerHTML = ""

    // 1- gets data from localStorage on every render
    let [todo_list, done_list] = loadTasksFromStorage();

    // 2 -filter lists according to search
    if (search) {
        search = '/' + search + '/gi';
        todo_list = todo_list.filter((task) => task.description.match(search) || task.title.match(search));
        done_list = done_list.filter((task) => task.description.match(search) || task.title.match(search));
    }

    // 3 - sort list // TODO give the sorting function to this, but not as a parameter, keep each list sorting separate
    todo_list = todo_list.sort((a, b) => a.priority > b.priority ? 1 : -1);
    done_list = done_list.sort((a, b) => a.priority > b.priority ? 1 : -1);
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

function addTask() {
    hideHandler();
    // create task object, add to local storage, call renderLists function
    let new_task = createTaskObject();
    localStorage.setItem("tasks", JSON.stringify([...JSON.parse(localStorage.getItem("tasks") || "[]"), new_task]));
    renderLists();
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

// TODO store sorting functions in an array and store config of each list somewhere
// end of utility functions section


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







// global variables
// task_being_edited={store data here, for cancel as well}





// TODO main functions


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


// On form submit add task
$("form")[0].addEventListener("submit", e => {
    e.preventDefault();
    addTask();
});

// TODO test if not needed delete
// function loadFromLocalStorage() {
//     // if local storage empty, break
//     if (localStorage.getItem("tasks") == null) return;
//     // Get the tasks from localStorage and convert it to an array
//     let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
//     // TODO sort default then append
//     // Loop through the tasks and add them to the list
//     tasks.forEach(task => {
//         const li = createTaskHTMLElement(task);
//         if (task.state) {
//             done_items_view.insertBefore(li, done_items_view.children[0]);
//         } else {
//             todo_items_view.insertBefore(li, todo_items_view.children[0]);
//         }
//     });
// }



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
    // TODO store the id and the state somewhere,
    // then make the create task object look for those values
    // TODO clean up the task_being_edited from local storage or whatever

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



// onload:
// renderLists
// On app load, get all tasks from localStorage
// window.onload = loadFromLocalStorage;