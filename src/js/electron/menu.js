const { app, Menu, MenuItem, dialog, ipcMain, BrowserWindow } = require('electron')
var fs = require('fs');


function about() {

}

function Open() {
    dialog.showOpenDialog(
    { properties: ['openFile', 'openDirectory'],
      filters: [{name: 'Markdown', extensions: ['md', 'markdown'] }] }, 
    function(filePaths) {
        if (typeof filePaths == 'undefined' || filePaths.length == 0) {
            console.log('file empty')
            return
        }
        console.log("get file: " + filePaths[0])

        var winId = BrowserWindow.getFocusedWindow().id;
        let win = BrowserWindow.fromId(winId);

        win && win.webContents.send('file_data', {
            'file_path': filePaths[0],
        })

        /*
        fs.readFile(filePaths[0], 'utf8', function(err, data){
            console.log(data);
            
            var winId = BrowserWindow.getFocusedWindow().id;
            let win = BrowserWindow.fromId(winId);

            win && win.webContents.send('file_data', {
                'file_path': filePaths,
                'file_data': data
            })
        });
        */
    })
}

function Save() {
    var winId = BrowserWindow.getFocusedWindow().id;
    let win = BrowserWindow.fromId(winId);

    win && win.webContents.send('save_file', {})
}

function aaa() {
  console.log(233)
}

const template = [
  {
    label: 'Main',
    submenu: [
      { label: 'About', click: aaa },
      { type: 'separator' },
      { label: 'Quit'}
    ]
  },
  {
    label: 'File',
    submenu: [
      { label: 'New'},
      { type: 'separator' },
      { label: 'Open...', accelerator: 'CmdOrCtrl+O', click: Open},
      { label: 'Open Recent'},
      { type: 'separator' },
      { label: 'Close'},
      { label: 'Save', accelerator: 'CmdOrCtrl+S', click: Save},
      { label: 'Rename'},
      { type: 'separator' },
      { label: 'Share'},
      { label: 'Export'},
      { type: 'separator' },
      { label: 'Print'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteandmatchstyle' },
      { role: 'delete' },
      { role: 'selectall' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      // { role: 'toggledevtools' },
      // { type: 'separator' },
      // { role: 'resetzoom' },
      // { role: 'zoomin' },
      // { role: 'zoomout' },
      { type: 'separator' },
      { role: 'toggledevtools' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'close' }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://electronjs.org') }
      }
    ]
  }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)


module.exports = function() {
    


}
