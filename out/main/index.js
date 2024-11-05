"use strict";
const electron = require("electron");
const path = require("path");
const utils = require("@electron-toolkit/utils");
const Splashscreen = require("@trodi/electron-splashscreen");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const Splashscreen__namespace = /* @__PURE__ */ _interopNamespaceDefault(Splashscreen);
const icon = path.join(__dirname, "../../resources/icon.png");
function createWindow() {
  const windowOptions = {
    width: 1920,
    height: 1080,
    show: false,
    autoHideMenuBar: true,
    ...process.platform === "linux" ? { icon } : {},
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  };
  const mainWindow = Splashscreen__namespace.initSplashScreen({
    windowOpts: windowOptions,
    templateUrl: path.join(__dirname, "../../resources/splash.svg"),
    delay: 0,
    minVisible: 1500,
    splashScreenOpts: {
      width: 612,
      height: 792,
      transparent: true
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    console.log(path.join(__dirname, "../renderer/index.html"));
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
electron.app.commandLine.appendSwitch("enable-experimental-web-platform-features");
electron.app.whenReady().then(() => {
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
