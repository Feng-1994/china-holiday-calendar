const { app, BrowserWindow, Tray, Menu, screen, nativeImage, globalShortcut, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        const primaryDisplay = screen.getPrimaryDisplay();
        const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
        mainWindow.setBounds({
          x: screenWidth - 1200 - 12,
          y: screenHeight - 720 - 12,
          width: 1200,
          height: 720,
        });
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

let tray = null;
let mainWindow = null;
let widgetWindow = null;
let hideTimer = null;
let settings = {
  autoLaunch: false,
  shortcutKey: 'CommandOrControl+Shift+C',
  widgetVisible: true,
  widgetPosition: null,
};

let SETTINGS_FILE = '';

function loadSettings() {
  SETTINGS_FILE = path.join(app.getPath('userData'), 'widget-settings.json');
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      settings = { ...settings, ...data };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
}

function saveSettings() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

function getIconPath() {
  const paths = [
    path.join(process.resourcesPath, 'tray-icon.png'),
    path.join(__dirname, '..', 'public', 'tray-icon.png'),
    path.join(__dirname, '..', 'dist', 'tray-icon.png'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function createTrayIcon() {
  const iconPath = getIconPath();
  if (iconPath) {
    return nativeImage.createFromPath(iconPath);
  }

  const size = 16;
  const png = Buffer.alloc(size * size * 4 + 100);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (x >= 2 && x <= 13 && y >= 2 && y <= 13) {
        if (y <= 5) {
          png[i] = 233; png[i + 1] = 163; png[i + 2] = 25;
        } else {
          png[i] = 197; png[i + 1] = 61; png[i + 2] = 67;
        }
        png[i + 3] = 255;
      }
    }
  }
  return nativeImage.createFromBuffer(png, { width: size, height: size });
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const winWidth = 1200;
  const winHeight = 720;

  mainWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: screenWidth - winWidth - 12,
    y: screenHeight - winHeight - 12,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: false,
    focusable: true,
    icon: createTrayIcon(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = process.env.ELECTRON_DEV === '1';
  const devPort = process.env.VITE_PORT || '5173';
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${devPort}`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  mainWindow.on('blur', () => {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (mainWindow && mainWindow.isVisible() && !mainWindow.isDestroyed()) {
        const focusedWin = BrowserWindow.getFocusedWindow();
        if (focusedWin !== mainWindow) {
          mainWindow.hide();
        }
      }
      hideTimer = null;
    }, 300);
  });

  mainWindow.on('focus', () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  });

  mainWindow.on('show', () => {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      mainWindow.hide();
      event.preventDefault();
    }
  });

  mainWindow.setVisibleOnAllWorkspaces(true);
}

const WIDGET_EXPANDED_WIDTH = 320;
const WIDGET_EXPANDED_HEIGHT = 380;

function createWidgetWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  let posX, posY;
  if (settings.widgetPosition) {
    posX = settings.widgetPosition.x;
    posY = settings.widgetPosition.y;
  } else {
    posX = screenWidth - WIDGET_EXPANDED_WIDTH - 20;
    posY = 20;
  }

  widgetWindow = new BrowserWindow({
    width: WIDGET_EXPANDED_WIDTH,
    height: WIDGET_EXPANDED_HEIGHT,
    x: posX,
    y: posY,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: true,
    show: settings.widgetVisible,
    hasShadow: false,
    icon: createTrayIcon(),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const isDev = process.env.ELECTRON_DEV === '1';
  const devPort = process.env.VITE_PORT || '5173';
  if (isDev) {
    widgetWindow.loadURL(`http://localhost:${devPort}/widget.html`);
  } else {
    widgetWindow.loadFile(path.join(__dirname, '..', 'dist', 'widget.html'));
  }

  widgetWindow.setVisibleOnAllWorkspaces(true);

  widgetWindow.on('moved', () => {
    if (widgetWindow) {
      const bounds = widgetWindow.getBounds();
      settings.widgetPosition = { x: bounds.x, y: bounds.y };
      saveSettings();
    }
  });

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });

  widgetWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'Escape') {
      widgetWindow.hide();
      settings.widgetVisible = false;
      saveSettings();
      tray.setContextMenu(buildContextMenu());
      event.preventDefault();
    }
  });
}

function toggleWindow() {
  if (!mainWindow) return;

  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  if (mainWindow.isVisible() && mainWindow.isFocused()) {
    mainWindow.hide();
  } else {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    const winWidth = 1200;
    const winHeight = 720;
    mainWindow.setBounds({
      x: screenWidth - winWidth - 12,
      y: screenHeight - winHeight - 12,
      width: winWidth,
      height: winHeight,
    });
    mainWindow.show();
    mainWindow.focus();
  }
}

function toggleWidget() {
  if (!widgetWindow) return;
  if (widgetWindow.isVisible()) {
    widgetWindow.hide();
    settings.widgetVisible = false;
  } else {
    widgetWindow.show();
    settings.widgetVisible = true;
  }
  saveSettings();
  tray.setContextMenu(buildContextMenu());
}

function registerShortcut() {
  globalShortcut.unregisterAll();
  try {
    globalShortcut.register(settings.shortcutKey, toggleWindow);
  } catch (e) {
    console.error('Failed to register shortcut:', e);
  }
}

function setAutoLaunch(enable) {
  app.setLoginItemSettings({
    openAtLogin: enable,
    openAsHidden: true,
    name: '中国节假日日历',
  });
  settings.autoLaunch = enable;
  saveSettings();
}

function buildContextMenu() {
  return Menu.buildFromTemplate([
    { label: '显示日历', click: toggleWindow },
    { type: 'separator' },
    {
      label: settings.widgetVisible ? '✓ 桌面小组件' : '桌面小组件',
      click: () => {
        toggleWidget();
      },
    },
    {
      label: settings.autoLaunch ? '✓ 开机自启' : '开机自启',
      click: () => {
        setAutoLaunch(!settings.autoLaunch);
        tray.setContextMenu(buildContextMenu());
      },
    },
    { type: 'separator' },
    {
      label: '快捷键: Ctrl+Shift+C',
      enabled: false,
    },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() },
  ]);
}

app.whenReady().then(() => {
  loadSettings();

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'geolocation') {
      callback(true);
    } else {
      callback(false);
    }
  });

  const loginSettings = app.getLoginItemSettings();
  settings.autoLaunch = loginSettings.openAtLogin;

  const icon = createTrayIcon();
  tray = new Tray(icon);

  const now = new Date();
  const dateStr = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
  tray.setToolTip(`中国节假日日历 - ${dateStr}`);

  tray.setContextMenu(buildContextMenu());
  tray.on('click', toggleWindow);
  tray.on('double-click', toggleWindow);

  createWindow();
  createWidgetWindow();
  registerShortcut();

  ipcMain.on('open-main-window', () => {
    toggleWindow();
  });

  ipcMain.on('resize-widget', (event, width, height) => {
    if (widgetWindow && !widgetWindow.isDestroyed()) {
      const bounds = widgetWindow.getBounds();
      widgetWindow.setBounds({
        x: bounds.x,
        y: bounds.y,
        width: Math.ceil(width),
        height: Math.ceil(height),
      });
    }
  });
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});

app.on('before-quit', () => {
  globalShortcut.unregisterAll();
  if (mainWindow) mainWindow.destroy();
  if (widgetWindow) widgetWindow.destroy();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
