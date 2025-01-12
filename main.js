const path = require("path");
const {app, BrowserWindow, ipcMain, Menu, dialog} = require("electron");
const fs = require("fs");
const {menu} = require("./menu.js");

const isMac = process.platform === "darwin";
const isDev = process.env.NODE_ENV !== "development";

const WIDTH = 1280;
const HEIGHT = WIDTH / 16 * 9;

let workspace = "";
let window = undefined;

function createWindow()
{
    window = new BrowserWindow(
    {
        title: "Manageable",
        width: WIDTH,
        height: HEIGHT,
        webPreferences:
        {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, "./preloader/preloader.js")
        }
    });

    Menu.setApplicationMenu(menu);
    window.loadFile(path.join(__dirname, "./renderer/index.html"));
}

app.whenReady().then(() => 
{
    createWindow();
    app.on("activate", () =>
    {
        if (BrowserWindow.getAllWindows.length === 0) createWindow();
    });
});

try
{
    if (!fs.existsSync(app.getPath("documents") + "/workspaces")) fs.mkdirSync(app.getPath("documents") + "/workspaces")
}

catch (err)
{
    console.log(err);
}

ipcMain.handle("create_workspace", (event) =>
{
    let output = "";
    const result = dialog.showSaveDialogSync(window, 
    {
        defaultPath: path.join(app.getPath("documents") + "/workspaces/", "New Workspace.json")
    });

    if (result)
    {
        fs.writeFileSync(result, "{}", (err) =>
        {
            if (err) 
            {
                console.log(err);
                throw err;
            }
        });

        workspace = result;
        output = result;
    }
    return output;
});

ipcMain.handle("load_workspace", (event) =>
{
    let output = "";
    const result = dialog.showOpenDialogSync(window, 
    {
        defaultPath: path.join(app.getPath("documents") + "/workspaces/")
    })

    if (result)
    {
        workspace = result[0];
        const data = fs.readFileSync(result[0]);
        output = JSON.parse(data);
    }
    return output;
});

ipcMain.on("write_to_workspace", (event, task) =>
{
    const json = JSON.stringify(task, null, "\t");
    fs.writeFile(workspace, json, (err) =>
    {
        if (err)
        {
            console.log(err);
            throw err;
        }
    });
});

app.on("window-all-closed", () =>
{
    app.quit();
});