const { app, Menu, MenuItem, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('fs');
require('./app_menu')

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win

function createWindow() {
  // const menu = new Menu()
  // menu.append(new MenuItem({ label: 'MenuItem1', click() { console.log('item 1 clicked') } }))
  // menu.append(new MenuItem({ type: 'separator' }))
  // menu.append(new MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }))

    // 创建浏览器窗口。
    win = new BrowserWindow({ backgroundColor: '#fff', width: 950, height: 700, titleBarStyle: 'hidden' })

    // win.setProgressBar(0.5)

    // 然后加载应用的 index.html。
    win.loadFile("src/view/index.html")
    // 打开开发者工具
    // win.webContents.openDevTools()

    // 当 window 被关闭，这个事件会被触发。
    win.on('closed', () => {
        // 取消引用 window 对象，如果你的应用支持多窗口的话，
        // 通常会把多个 window 对象存放在一个数组里面，
        // 与此同时，你应该删除相应的元素。
        win = null
    })

    // if (process.env.noinject != 1) {
    //   var client = require('electron-connect').client;
    //   client.create(win, {sendBounds: false});  
    // }
    

    // console.log(dialog.showOpenDialog({ properties: ['openFile', 'openDirectory', 'multiSelections'] }))
}

// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (win === null) {
        createWindow()
    }
})


ipcMain.on('renderer:save_file', (event, data) => {
  console.log(data)
  var filePath = data.file_path
  if (!filePath) {
    // no file, choose new file
    chooseFilePath = dialog.showSaveDialog({
      title: '保存文件',
      filters: [
        { name: 'All Files', extensions: ['md', 'markdown']}
      ]
    })
    if (!chooseFilePath) {
        console.log('cancel create file')
        return
    }
    filePath = chooseFilePath
    console.log('create file: ' + chooseFilePath)
  }

  fs.writeFile(filePath, data.file_data, function(err) {
      if (err) {
          return console.error(err)
      }

      event.sender.send('main:save_file_success', {
        file_path: filePath,
        file_data: data.file_data
      })
      console.log("write success")
  })
  return
})

// 在这个文件中，你可以续写应用剩下主进程代码。
// 也可以拆分成几个文件，然后用 require 导入。