const path = require('path')
const { app, Menu, ipcMain, Tray } = require('electron')
const log = require('electron-log')
const Store = require('./Store')
const MainWindow = require('./MainWindow')

// Set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow
let tray

// Init Store & Defaults
const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5
    }
  }
})

function createMainWindow() {
  mainWindow = new MainWindow('./app/index.html', isDev)
}

app.on('ready', () => {
  createMainWindow()

  mainWindow.webContents.on('dom-ready', () => {
  mainWindow.webContents.send('settings:get', store.get('settings'))
  })

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png')

  mainWindow.on('close', e => {
    if(!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    } else {
      return true
    }
  })

  // Create tray
  tray = new Tray(icon)

  tray.on('click', () => {
    if(mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true
          app.quit()
        }
      }
    ])

    tray.popUpContextMenu(contextMenu)
  })
})

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Navigation',
        click: () => {
          mainWindow.webContents.send('nav:toggle')
        }
      }
    ]
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
]

// Set settings
ipcMain.on('settings:set', (e, settings) => {
  store.set('settings', settings)
  mainWindow.webContents.send('settings:get', store.get('settings'))
})

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

app.allowRendererProcessReuse = true
