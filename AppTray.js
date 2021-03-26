const { app, Menu, Tray } = require('electron')

class AppTray {
    constructor(icon, mainWindow) {
        this.tray = new Tray(icon)

        this.tray.setToolTip('SysTop')

        this.mainWindow = mainWindow
        this.tray.on('click', this.onClick.bind(this))
        this.tray.on('right-click', this.onRightClick.bind(this))
    }

    onClick() {
        if(this.mainWindow.isVisible()) {
            this.mainWindow.hide()
          } else {
            this.mainWindow.show()
          }
    }

    onRightClick() {
        const contextMenu = Menu.buildFromTemplate([
            {
              label: 'Quit',
              click: () => {
                app.isQuitting = true
                app.quit()
              }
            }
          ])
      
          this.tray.popUpContextMenu(contextMenu)
    }
}

module.exports = AppTray