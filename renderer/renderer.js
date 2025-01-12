const STICKY_NOTES_WINDOW = document.getElementById("stick_notes_window");
const TASKS_WINDOW = document.getElementById("tasks_window");

const STICKY_NOTES_GRIDDER = document.getElementById("sticky_notes_gridder");
const TASKS_GRIDDER = document.getElementById("tasks_gridder");

const ADD_WORKSPACE_BUTTON = document.getElementById("menu_btn_create_workspace");
const LOAD_WORKSPACE_BUTTON = document.getElementById("menu_btn_load_workspace");

const ADD_NOTE_MENU_BUTTON = document.getElementById("menu_btn_add_note");
const ADD_NOTE_SECTION_BUTTON = document.getElementById("sect_btn_add_note");
const ADD_TASK_MENU_BUTTON = document.getElementById("menu_btn_add_task");
const ADD_TASK_SECTION_BUTTON = document.getElementById("sect_btn_add_task");

ADD_WORKSPACE_BUTTON.addEventListener("click", async () => 
{
    const input = await window.api.createWorkspace();
    if (input === "") return;
    while (TASKS_GRIDDER.lastElementChild) TASKS_GRIDDER.removeChild(TASKS_GRIDDER.lastElementChild);
    ADD_TASK_MENU_BUTTON.disabled = "";
    ADD_TASK_SECTION_BUTTON.disabled = "";
});

LOAD_WORKSPACE_BUTTON.addEventListener("click", async () =>
{
    const input = await window.api.loadWorkspace();
    if (input === "") return;
    taskList = new Map(Object.entries(input));
    while (TASKS_GRIDDER.lastElementChild) TASKS_GRIDDER.removeChild(TASKS_GRIDDER.lastElementChild);
    taskList.forEach((task) => addTask(task, false));
    ADD_TASK_MENU_BUTTON.disabled = "";
    ADD_TASK_SECTION_BUTTON.disabled = "";
});

ADD_NOTE_MENU_BUTTON.addEventListener("click", () => addNote());
ADD_NOTE_SECTION_BUTTON.addEventListener("click", () => addNote());

ADD_TASK_MENU_BUTTON.addEventListener("click", () => addTask(null, true));
ADD_TASK_MENU_BUTTON.disabled = "true";

ADD_TASK_SECTION_BUTTON.addEventListener("click", () => addTask(null, true));
ADD_TASK_SECTION_BUTTON.disabled = "true";

let noteCounter = 0;
let taskList = new Map();

function addTask(taskObj, isNew)
{
    let goalList = new Map();
    let task = document.createElement("div");
    let taskID = "";
    let completedGoals = 0;
    let percent = 0;
    let title = document.createElement("input");
    let finished = document.createElement("button");
    let edit = document.createElement("button");
    let confirmEdit = document.createElement("button");
    let removeTask = document.createElement("button");
    let titleBar = document.createElement("div");
    let desc = document.createElement("textarea");
    let percentage = document.createElement("p");
    let progressContent = document.createElement("div");
    let progress = document.createElement("div");
    let goals = document.createElement("div");
    let addGoal = document.createElement("button");

    title.className = "input task_title";
    title.type = "text"
    title.placeholder = "New Task";

    finished.className = "task_btn finished";
    finished.type = "button";
    finished.innerHTML = "<i class=\"bx bxs-flag-checkered bx-sm\"></i>";
    if (task.percentage == 100) finished.hidden = "";
    else finished.hidden = "true";
    finished.addEventListener("click", () =>
    {
        TASKS_GRIDDER.removeChild(task);
    });

    edit.className = "task_btn edit";
    edit.type = "button";
    edit.innerHTML = "<i class=\"bx bxs-edit-alt bx-sm\"></i>";
    edit.hidden = "true";
    edit.addEventListener("click", () =>
    {
        confirmEdit.hidden = "";
        removeTask.hidden = "";
        edit.hidden = "true";

        title.readOnly = "";
        desc.readOnly = "";
        addGoal.disabled = "true";
    });

    confirmEdit.className = "task_btn confirm_edit";
    confirmEdit.type = "button";
    confirmEdit.innerHTML = "<i class=\"bx bx-check bx-sm\"></i>";
    confirmEdit.addEventListener("click", () =>
    {
        edit.hidden = "";
        confirmEdit.hidden = "true";
        removeTask.hidden = "true";

        title.readOnly = "true";
        desc.readOnly = "true";
        addGoal.disabled = "";
        taskID = title.value;

        writeTaskToJSON(taskID, title, desc, percentage, goalList);
    });

    removeTask.className = "task_btn remove";
    removeTask.type = "type";
    removeTask.innerHTML = "<i class=\"bx bxs-trash bx-sm\"></i>";
    removeTask.addEventListener("click", () =>
    {
        if (taskList.has(taskID)) taskList.delete(taskID);
        TASKS_GRIDDER.removeChild(task);
        window.api.writeToWorkspace(Object.fromEntries(taskList));
    });

    titleBar.className = "title_bar";
    titleBar.appendChild(title);
    titleBar.appendChild(finished);
    titleBar.appendChild(edit);
    titleBar.appendChild(confirmEdit);
    titleBar.appendChild(removeTask);

    desc.className = "input task_desc"
    desc.placeholder = "Task Description";
    desc.rows = "5";
    
    percentage.className = "percentage";
    
    progressContent.className = "progress none";
    
    progress.className = "progress";
    progress.appendChild(progressContent);

    goals.className = "goals";

    addGoal.className = "task_btn add_goal";
    addGoal.innerHTML = "<i class=\"bx bx-plus bx-xs\"></i>Add Goals";
    addGoal.disabled = "true";
    addGoal.addEventListener("click", () =>
    {
        addNewGoal(false, "", taskID, task, title, desc, percent, percentage, progressContent, goals, goalList, finished, true);
        task.setAttribute("goals", (parseInt(task.getAttribute("goals")) + 1).toString());
        changeProgress(task, percent, percentage, progressContent, finished);
    });

    goals.appendChild(addGoal);

    if (!isNew)
    {
        goalList = new Map(Object.entries(taskObj.goalList));
        
        title.value = taskObj.title;
        taskID = title.value;
        desc.value = taskObj.desc;
        percentage.textContent = taskObj.percentage + "%";
        progressContent.style.width = taskObj.percentage + "%";

        goalList.forEach((value, key) =>
        {
            if (value) completedGoals++;
            addNewGoal(value, key, taskID, task, title, desc, percent, percentage, progressContent, goals, goalList, finished, false);
        });
        
        if (taskObj.percentage == 100) progressContent.className = "progress complete";
        else if (taskObj.percentage >= 75) progressContent.className = "progress substantial";
        else if (taskObj.percentage >= 50) progressContent.className = "progress moderate";
        else if (taskObj.percentage >= 25) progressContent.className = "progress fair";
        else if (taskObj.percentage > 0) progressContent.className = "progress poor";

        title.readOnly = "true";
        desc.readOnly = "true";

        edit.hidden = "";
        confirmEdit.hidden = "true";
        removeTask.hidden = "true";

        addGoal.disabled = "";
    }

    task.className = "task";
    task.setAttribute("goals", goalList.size.toString());
    task.setAttribute("completed", completedGoals.toString());

    task.appendChild(titleBar);
    task.appendChild(desc);
    task.appendChild(percentage);
    task.appendChild(progress);
    task.appendChild(goals);

    TASKS_GRIDDER.appendChild(task);
}

function addNote()
{
    noteCounter++;

    let text = document.createElement("textarea");
    text.className = "input sticky_note";
    text.placeholder = "New Note";
    text.rows = "6";

    let cycleColor = document.createElement("button");
    cycleColor.className = "note_btn cycle_color";
    cycleColor.innerHTML = "<i class=\"bx bxs-palette bx-sm\"></i>";
    cycleColor.addEventListener("click", () =>
    {
        if (note.getAttribute("color_index") === "0") 
        {
            note.className = "note green";
            note.setAttribute("color_index", "1");
            return;
        }

        if (note.getAttribute("color_index") === "1") 
        {
            note.className = "note pink";
            note.setAttribute("color_index", "2");
            return;
        }

        if (note.getAttribute("color_index") === "2") 
        {
            note.className = "note yellow";
            note.setAttribute("color_index", "0");
            return;
        }
    });

    let remove = document.createElement("button");
    remove.className = "note_btn remove";
    remove.innerHTML = "<i class=\"bx bxs-trash bx-sm\"></i>";
    remove.addEventListener("click", () =>
    {
        STICKY_NOTES_GRIDDER.removeChild(note);
        noteCounter--;
    });

    let actionBar = document.createElement("div");
    actionBar.className = "note_action_bar";
    actionBar.appendChild(cycleColor);
    actionBar.appendChild(remove);

    let note = document.createElement("div");
    note.className = "note yellow";
    note.appendChild(text);
    note.appendChild(actionBar);
    note.setAttribute("color_index", "0");

    STICKY_NOTES_GRIDDER.appendChild(note);

    if (noteCounter == 16)
    {
        ADD_NOTE_MENU_BUTTON.disabled = true;
        ADD_NOTE_SECTION_BUTTON.disabled = true;
    }
}

function addNewGoal(value, key, taskID, task, title, desc, percent, percentage, progressContent, goals, goalList, finished, isNew)
{
    let newGoal = document.createElement("div");
    let checkbox = document.createElement("input");
    let edit = document.createElement("button");
    let confirmEdit = document.createElement("button");
    let goalTextArea = document.createElement("textarea");
    let removeGoal = document.createElement("button");

    newGoal.className = "goal";

    checkbox.className = "goal checkbox";
    checkbox.type = "checkbox";
    checkbox.style.display = "block";
    if (value) checkbox.checked = "true";
    else checkbox.checked = "";
    checkbox.addEventListener("click", () =>
    {
        if (checkbox.checked) task.setAttribute("completed", (parseInt(task.getAttribute("completed")) + 1) + "");
        else task.setAttribute("completed", parseInt(task.getAttribute("completed") - 1) + "");
        changeProgress(task, percent, percentage, progressContent, finished);
        goalList.set(goalTextArea.value, checkbox.checked);
        writeTaskToJSON(taskID, title, desc, percentage, goalList);
    })

    edit.className = "task_btn edit";
    edit.type = "button";
    edit.innerHTML = "<i class=\"bx bxs-edit-alt\"></i>";
    edit.hidden = "";
    edit.addEventListener("click", () =>
    {
        confirmEdit.hidden = "";
        edit.hidden = "true";
        checkbox.style.display = "none";
        goalList.delete(goalTextArea.value);
        goalTextArea.readOnly = "";
    });

    confirmEdit.className = "task_btn confirm_edit";
    confirmEdit.type = "button";
    confirmEdit.innerHTML = "<i class=\"bx bx-check\"></i>";
    confirmEdit.hidden = "true";
    confirmEdit.addEventListener("click", () =>
    {
        edit.hidden = "";
        confirmEdit.hidden = "true";
        checkbox.style.display = "block";

        goalTextArea.readOnly = "true";
        goalList.set(goalTextArea.value, checkbox.checked);
        writeTaskToJSON(taskID, title, desc, percentage, goalList);
    });

    goalTextArea.className = "input goal_name";
    goalTextArea.placeholder = "New Goal";
    goalTextArea.rows = "1";
    goalTextArea.value = key;
    goalTextArea.readOnly = "true";

    removeGoal.className = "task_btn remove_goal";
    removeGoal.innerHTML = "<i class=\"bx bxs-trash\"></i>";
    removeGoal.addEventListener("click", () =>
    {
        if (checkbox.checked) task.setAttribute("completed", parseInt(task.getAttribute("completed") - 1) + "");
        task.setAttribute("goals", (parseInt(task.getAttribute("goals")) - 1) + "");
        goalList.delete(goalTextArea.value);
        goals.removeChild(newGoal);
        changeProgress(task, percent, percentage, progressContent, finished);
        writeTaskToJSON(taskID, title, desc, percentage, goalList);
    });

    if (isNew)
    {
        edit.hidden = "true";
        confirmEdit.hidden = "";
        goalTextArea.readOnly = "";
        checkbox.style.display = "none";
        goalList.set(goalTextArea.value, false);
    }

    newGoal.appendChild(checkbox);
    newGoal.appendChild(goalTextArea);
    newGoal.appendChild(edit);
    newGoal.appendChild(confirmEdit);
    newGoal.appendChild(removeGoal);

    goals.appendChild(newGoal);
}

function writeTaskToJSON(taskID, title, desc, percentage, goalList)
{   
    let taskObj = 
    {
        title: title.value,
        desc: desc.value,
        percentage: percentage.textContent.substring(0, percentage.textContent.length - 1),
        goalList: Object.fromEntries(goalList)
    };
    taskList.set(taskID, taskObj);
    window.api.writeToWorkspace(Object.fromEntries(taskList));
}

function changeProgress(task, percent, percentage, progressContent, finished)
{
    if (task.getAttribute("goals") == 0) percent = 0;
    else percent = parseFloat(((parseInt(task.getAttribute("completed")) / parseFloat(task.getAttribute("goals"))) * 100).toFixed(2));
    if (percent == 100) progressContent.className = "progress complete";
    else if (percent >= 75) progressContent.className = "progress substantial";
    else if (percent >= 50) progressContent.className = "progress moderate";
    else if (percent >= 25) progressContent.className = "progress fair";
    else if (percent > 0) progressContent.className = "progress poor";
    else progressContent.className = "progress none";
    percentage.textContent = percent + "%";

    if (percent == 100) 
    {
        progressContent.style.width = "auto";
        finished.hidden = "";
    }
    else 
    {
        progressContent.style.width = percent + "%";
        finished.hidden = "true";
    }
}