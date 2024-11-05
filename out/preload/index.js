"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  // ipcRenderer to talk to ipcMain, call the handle dialog
  // openImgFile: () => ipcRenderer.invoke("dialog:openImgFile"),
  // openJsonFile: () => ipcRenderer.invoke("dialog:openJsonFile")
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
