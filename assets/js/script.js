const fs = require('fs')
var archiver = require('archiver');
const app = remote.app;
const dialog = remote.dialog;

require('electron').ipcRenderer.on('clean', function(event) {
	let w = remote.getCurrentWindow();
	if(askForNameEnabled) {
		$('#archive-name-modal').show();
		w.show();
	} else {
		clean();
	}
});

const Swal = require('sweetalert2') // In order to make cool alerts

// Basic imports, JQuery and ShellJS
var $ = jQuery = require('jquery')
var shell = require('shelljs');
shell.config.execPath = shell.which('node');


// --- Database ---
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync(app.getPath('userData') + '/' + 'config.json')
const db = low(adapter)
// --- Database ---

//const configName = 'config.txt';

var exceptionFiles = [];
var desktopFiles = [];

// Because of differences in height of titlebar for each platform, sidebar's height has to be set manually
var sidebarPercentage = '';
if (process.platform !== 'darwin') {
	sidebarPercentage = '32px'; // ???????
} else {
	sidebarPercentage = '24px';
}
$('#exceptions-sidebar').css({height: 'calc(100% - ' + sidebarPercentage + ')'});

// Green button to apply all chosen exceptions
function applyExceptions() {
	var exceptions = document.querySelectorAll('input[class=exception-checkbox]:checked');
	exceptionFiles = [];
	for(var i = 0; i < exceptions.length; i++) {
		exceptionFiles[i] = exceptions[i].value
	}
	if(exceptions.length != 0)
		$('#exceptions-label').text(exceptions.length + ' SELECTED');
	else
		$('#exceptions-label').text('NOTHING SELECTED');
	$('#exceptions-sidebar').css({width: '0'});
}

// Desktop files and folders to exception list
refreshFiles();
function refreshFiles() {
	desktopFiles = shell.ls('~/Desktop');
	$('#exceptions-inner').html('');
	for(var i = 0; i < desktopFiles.length; i++) {
		$('#exceptions-inner').append('\
			<label class="exceptions-item">\
                    <div>' + desktopFiles[i] + '</div>\
                    <input type="checkbox" id="exception-' + desktopFiles[i] + '" class="exception-checkbox" value="' + desktopFiles[i] + '">\
                    <i class="fa fa-check"></i>\
             </label>');
	}
}

// For custom file input
$('#choose-directory').change(function() {
	try {
		var i = $(this).prev('label').clone();
		var file = $('#choose-directory')[0].files[0].path;
		$(this).prev('label').text(file);
		$('#location-error').hide();
	} catch(err) {
		$(this).prev('label').text('NO LOCATION SPECIFIED');
		$('#location-error').show();
	}
});

$('#archive-name-cancel').on('click', function() {
	$('#archive-name-modal').hide();
	w.hide();
});

$('#archive-name-ok').on('click', function() {
	let archiveName = $('#archive-name').val()
	if(/^[\w.-]+$/.test(archiveName) && archiveName.trim() != '') {
		$('#archive-name-modal').hide();
		$('#archive-name').css('border', '1px solid #7b8d9c');
		$('#archive-name').val('');
		clean(archiveName);
	} else {
		$('#archive-name').css('border', '1px solid red');
	}
});

$('#archive-name').keypress(function(e){
	if(e.which == 13){
		$('#archive-name-ok').click();
	}
});

/*
var configContent = fs.readFileSync(app.getPath('userData') + '/' + configName, 'utf-8');
var pathToDirectory = configContent.split(':')[0]
var sliderValue = configContent.split(':')[1]
var lastTime = Number(configContent.split(':')[2])
var interval = 1800000;
*/
var pathToDirectory;
var sliderValue;
var lastTime;
var askForNameEnabled;
var zipArchiveEnabled;
var interval = 1800000;
var iv;
loadConfig();

function apply() {
	
	if($('#choose-directory-label').text() == 'NO LOCATION SPECIFIED') {
		$('#location-error').show();
	} else {
		saveConfig();
		startClean();
	}
	//w.hide();
}

function showAlert(message) {
	Swal({
		title: '<span style="color:white">' + message + '</span>',
		background: '#181E26',
		color: 'white',
		type: 'success',
		confirmButtonColor: '#57d99c'
	}).then(function() {
		// it can do smth on 'OK' click
		w.close();
	});
	$('body').removeClass('swal2-height-auto');
	$('.swal2-styled:focus').css('box-shadow', 'none');
	$('.swal2-styled').css('border-radius', '2px');
	$('.swal2-popup .swal2-styled:not([disabled])').css('cursor', 'default');
}

function showNotification(message) {
	if (process.platform !== 'darwin') {
		dialog.showMessageBox(options={title: 'Desky', message: message})
	} else {
		let myNotification = new Notification('Desky', { body: message })
	}
}

function startClean() {
	// savedDate = new Date();
	let w = remote.getCurrentWindow();
	// sliderValue = $('#archiveFreqSlider').val();
	clearInterval(iv);
	console.log(sliderValue)
	switch(sliderValue) {
		case '1':
			showNotification('Desktop will be cleaned on demand only!');
			w.hide();
			//w.close();
			break;
		case '2':
			clean();
			iv = setInterval(checkClean.bind(null, 3600), interval); //3600, interval 
			//showAlert('All set!'); 
			showNotification('Desktop will be cleaned every hour!');
			w.hide();
			break;
		case '3':
			clean();
			iv = setInterval(checkClean.bind(null, 86400), interval); //86400, interval
			//showAlert('All set!'); 
			showNotification('Desktop will be cleaned every day!');
			w.hide();
			break;
		case '4':
			clean();
			iv = setInterval(checkClean.bind(null, 604800), interval); //604800, interval
			//showAlert('All set!'); 
			showNotification('Desktop will be cleaned every week!');
			w.hide();
			break;
		case '5':
			clean();
			iv = setInterval(checkClean.bind(null, 2419200), interval); //2419200, interval
			//showAlert('All set!'); 
			showNotification('Desktop will be cleaned every month!');
			w.hide();
			break;
	}
}

function checkClean(maxDifference) {
	var currentTime = $.now();
	timeDifference = (currentTime - lastTime) / 1000
	console.log(timeDifference);
	if(timeDifference >= maxDifference) {
		clean();
		saveConfig();
		//loadConfig();
	}
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

function clean(archiveName='') {

	var pathToArchive;

	if(archiveName != '') {
		pathToArchive = pathToDirectory + '/' + archiveName + '';
	} else {
		var currentdate = new Date();
		var datetime = currentdate.getDate() + '-'
					+ (currentdate.getMonth()+1)  + '-' 
					+ currentdate.getFullYear() + '@'  
					+ currentdate.getHours() + '-'
					+ currentdate.getMinutes();

		// var pathToDirectory = $('#choose-directory-label').val(); //$('#choose-directory')[0].files[0].path;
		pathToArchive = pathToDirectory + '/' + datetime;
	}

	// Check if application is somewhere on Desktop, if yes, add its path to exceptions (if it's not already there)
	executableLocation = app.getAppPath().replace(/\\/g, '/');
	shell.cd('~/Desktop');
	desktopLocation = shell.pwd()['stdout'] + '/';
	if(executableLocation.startsWith(desktopLocation)) {
		executableLocation = executableLocation.replace(desktopLocation, '') + '/';
		executableLocation = executableLocation.split('/')[0];
		if($.inArray(executableLocation, exceptionFiles) == -1) {
			exceptionFiles.push(executableLocation);
		}
	}
	
	refreshFiles();
	var filesToMove = desktopFiles.diff(exceptionFiles).diff(pathToDirectory);
	if(filesToMove.length > 0) {
		shell.mkdir(pathToArchive)
		//shell.cd('~/Desktop')
		shell.mv(filesToMove, pathToArchive);

		if(zipArchiveEnabled) {
			var output = fs.createWriteStream(pathToArchive + '.zip');
			var archive = archiver('zip', {
					zlib: { level: 0 } // Sets the compression level.
			});
			output.on('close', function() {
				shell.rm('-rf', pathToArchive)
			});
			archive.pipe(output);
			archive.directory(pathToArchive, '');
			archive.finalize();
		}

		refreshFiles();
		loadExceptions();

		showNotification('Desktop cleaned!');
	} else {
		showNotification('Nothing to clean!');
	}
}

function changeArchiveFrequency(step) {
	switch(step) {
		case '1':
			$('#freq-label').text('On demand');
			break;
		case '2':
			$('#freq-label').text('Once an hour');
			break;
		case '3':
			$('#freq-label').text('Once a day');
			break;
		case '4':
			$('#freq-label').text('Once a week');
			break;
		case '5':
			$('#freq-label').text('Once a month');
			break;
	}
}

function openExceptionsSidebar() {
	$('#exceptions-sidebar').css({width: '55%'});
}

function loadExceptions() {
	for(var i = 0; i < exceptionFiles.length; i++) {
		$('input[type=checkbox][value="' + exceptionFiles[i] + '"]').prop('checked', true);
	}
	applyExceptions();
}

function loadConfig() {
	try {
		pathToDirectory = db.get('archiveLocation').value();
		sliderValue = db.get('sliderValue').value();
		lastTime = db.get('lastTime').value();
		askForNameEnabled = db.get('askForNameEnabled').value();
		zipArchiveEnabled = db.get('zipArchiveEnabled').value();
		exceptionFiles = db.get('exceptions').value();

		changeArchiveFrequency(sliderValue);
		$('#choose-directory-label').text(pathToDirectory);
		$('#choose-directory-label').val(pathToDirectory);
		$('#archiveFreqSlider').val(sliderValue);

		// Exceptions
		loadExceptions();

		if(askForNameEnabled)
			$('#askForName').prop('checked', true);
		if(zipArchiveEnabled)
			$('#zipArchiveCheckbox').prop('checked', true);
		loadExceptions();

		//let w = remote.getCurrentWindow();
		//w.hide();

		if(sliderValue != '1')
			startClean();
	} catch(err) {
		if (!err instanceof TypeError) {
			throw err;
		}
	}
	
}

function saveConfig() {
	// Set some defaults (required if your JSON file is empty)
	db.defaults({ archiveLocation: '', exceptions: [], askForNameEnabled: false, zipArchiveEnabled: false, sliderValue: 0, lastTime: 0 }).write()

	pathToDirectory = $('#choose-directory-label').text();
	sliderValue = $('#archiveFreqSlider').val();
	lastTime = $.now();
	askForNameEnabled = $('#askForName').is(':checked');
	zipArchiveEnabled = $('#zipArchiveCheckbox').is(':checked');

	db.set('archiveLocation', pathToDirectory).write();
	db.set('askForNameEnabled', askForNameEnabled).write();
	db.set('zipArchiveEnabled', zipArchiveEnabled).write();
	db.set('sliderValue', sliderValue).write();
	db.set('lastTime', lastTime).write();
	db.set('exceptions', []).write();
	for(var i = 0; i < exceptionFiles.length; i++) {
		//console.log(exceptionFiles[i]);
		db.get('exceptions').push(exceptionFiles[i]).write();
	}
	console.log('SAVED');
}