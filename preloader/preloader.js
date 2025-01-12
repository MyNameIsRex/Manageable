const os = require("os");
const path = require("path");
const { contextBridge, ipcRenderer } = require("electron/renderer")

contextBridge.exposeInMainWorld("versions", 
{
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron
  // we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld("api", 
{
  createWorkspace: () => ipcRenderer.invoke("create_workspace"),
  loadWorkspace: () => ipcRenderer.invoke("load_workspace"),
  writeToWorkspace: (task) => ipcRenderer.send("write_to_workspace", task)
});