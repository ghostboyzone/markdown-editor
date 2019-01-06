window.leftPanelRate = 0.5;
var md = window.markdownit();
var $ = function(id) { return document.getElementById(id); };

function calcWidth(rate) {
    var totalWidth = $("main-container").clientWidth;
    var resizeWidth = $("resize-panel").clientWidth;
    var leftWidth = Math.floor((totalWidth - resizeWidth) * rate);
    var rightWidth = totalWidth - resizeWidth - leftWidth;
    $("left-panel").style.width = leftWidth + "px";
    $("right-panel").style.width = rightWidth + "px";
    $("right-panel").style.marginLeft = (leftWidth + resizeWidth) + "px";
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
            var totalWidth = $("main-container").clientWidth;
            var resizeWidth = $("resize-panel").clientWidth;
            var rate = endX / (2 * Math.floor((totalWidth - resizeWidth) * 0.5))
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
        if (!window.currFile) {
          document.title = 'Untitled[*]'
        } else {
          if (window.currFileOrgData == input.value) {
            document.title = window.currFile
          } else {
            document.title = window.currFile + '[*]'
          }
        }
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
ipc.on('file_data', (event, message) => {
    console.log(message)
    window.currFileOrgData = message.file_data
    document.getElementById("write").value = message.file_data
    window.currFile = message.file_path
    document.title = message.file_path
})