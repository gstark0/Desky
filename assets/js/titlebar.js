const remote = require('electron').remote
let w = remote.getCurrentWindow()

var t;

// Windows or Mac OS
if (process.platform !== 'darwin') {

	const titlebar = require('electron-titlebar-windows');
    t = new ElectronTitlebarWindows(options={fullscreen: false, draggable: true});

} else {

    const titlebar = require('titlebar');
    t = titlebar();

}

t.appendTo(document.body);
t.on('close', function(e) {
    w.close()
});