window.leftPanelRate = 0.5;
var md = window.markdownit();
var $ = function(id) { return document.getElementById(id); };

function calcWidth(rate) {
    var totalWidth = Math.min($("main-container").clientWidth, window.visualViewport.width);
    var resizeWidth = $("resize-panel").clientWidth;
    var leftWidth = Math.floor((totalWidth - resizeWidth * 0.5) * rate);
    var rightWidth = totalWidth - resizeWidth - leftWidth;

    console.log(totalWidth, resizeWidth, leftWidth, rightWidth)
    $("left-panel").style.width = leftWidth + "px";
    $("right-panel").style.width = rightWidth + "px";
    // $("right-panel").style.marginLeft = (leftWidth + resizeWidth) + "px";
}
window.onload = function() {
    calcWidth(window.leftPanelRate);
    var resize = $("resize-panel")
    var left = $("left-panel")
    var right = $("right-panel")
    resize.ondblclick = function() {
        window.leftPanelRate = 0.5
        calcWidth(window.leftPanelRate);
    }
    resize.onmousedown = function(e) {
        // var startX = e.clientX;
        resize.left = resize.offsetLeft;
        document.onmousemove = function(e) {
            var endX = e.clientX;
            // console.log(endX, startX)
            // det = endX - startX
            var totalWidth = Math.min($("main-container").clientWidth, window.visualViewport.width);
            var resizeWidth = $("resize-panel").clientWidth;
            var rate = endX / (2 * Math.floor((totalWidth - resizeWidth * 0.5) * 0.5))
            if (rate < 0.2) {
                window.leftPanelRate = 0.2;
            } else if (rate > 0.8) {
                window.leftPanelRate = 0.8;
            } else {
                window.leftPanelRate = rate;
            }
            console.log(endX, rate, window.leftPanelRate);
            calcWidth(window.leftPanelRate)
        }
        document.onmouseup = function(e) {
            document.onmousemove = null;
            document.onmouseup = null;
            resize.releaseCapture && resize.releaseCapture();
        }
        resize.setCapture && resize.setCapture();
    }
}
window.onresize = function() {
    calcWidth(window.leftPanelRate);
}

function Editor(input, preview) {
    this.update = function() {
        console.log("update")
        if (!window.currFile) {
          if (input.value) {
            document.title = 'Untitled[*]'
          } else {
            document.title = 'Untitled'
          }
          
        } else {
          if (window.currFileOrgData == input.value) {
            document.title = window.currFile
          } else {
            document.title = window.currFile + '[*]'
          }
        }
        var subLen = document.title.length > 20 ? 20 : document.title.length
        var startIdx = document.title.length - subLen;
        var subTitle = document.title.substr(startIdx, subLen)
        if (subLen < document.title.length) {
            subTitle = "..." + subTitle
        }
        $("header-title").innerHTML = subTitle
        preview.innerHTML = md.render(input.value)
    };
    input.editor = this;
    this.update();
}
new Editor($("write"), $("preview"));

document.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();

    for (let f of e.dataTransfer.files) {
        console.log('File(s) you dragged here: ', f.path)
    }
});
document.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
});
window.currFile = ''
window.currFileOrgData = ''

const ipc = require('electron').ipcRenderer;
ipc.on('main:file_data', (event, message) => {
    readAndShow(message.file_path)
})

ipc.on('main:save_file', (event, message) => {
    saveFile()
})

ipc.on('main:save_file_success', (event, message) => {
    window.currFile = message.file_path
    window.currFileOrgData = message.file_data
    $("write").editor.update()
})

var editor = CodeMirror.fromTextArea($("write"), {
    lineNumbers: true,
    textWrapping: true,
    lineWrapping: true,
    styleActiveLine: true,
    tabMode: "indent",
    width: '100%',
    height: '100%',
    mode:  "markdown",
    theme: "neo",
    indentUnit: 4,
    highlightFormatting: true,
    extraKeys: {"Enter": "newlineAndIndentContinueMarkdownList"}
});

editor.on('change', function(editorInstance, changes) {
    console.log(changes)
    editorInstance.save()
    $("write").editor.update()
})

editor.setOption("extraKeys", {
    Enter: "newlineAndIndentContinueMarkdownList",
    // Tab键换成4个空格
    Tab: function(cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces);
    }
});

function setEditorData(data) {
    editor.setValue(data)
    $("write").value = data
    $("write").editor.update()
}

ipc.on('main:new_file', (event, message) => {
    console.log('new file')
    window.currFile = ''
    window.currFileOrgData = ''
    setEditorData('')
})

document.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();

    for (let f of e.dataTransfer.files) {
        console.log('File(s) you dragged here: ', f.path)
        readAndShow(f.path)
    }
});
document.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

const fs = require('fs');

function readAndShow(filePath) {
    document.title = filePath
    window.currFile = filePath
    fs.readFile(filePath, 'utf8', function(err, data){
        console.log(filePath, data);
        window.currFileOrgData = data
        setEditorData(data)
    });
}

function saveFile() {
    var data = $("write").value
    ipc.send('renderer:save_file', {
        file_data: data,
        file_path: !window.currFile ? '' : window.currFile
    })
}