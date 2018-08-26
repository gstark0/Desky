const fs = require('fs')
const app = remote.app;

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
	sidebarPercentage = ''; // ???????
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
	if (process.platform !== 'darwin') {

	} else {
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
}

// For custom file input
$('#choose-directory').change(function() {
	var i = $(this).prev('label').clone();
	var file = $('#choose-directory')[0].files[0].path;
	$(this).prev('label').text(file);
});

function smartArchiveCheck() {
	if($('#smartArchiveCheckbox').is(':checked')) {
		$('#archiveFreqSlider').prop('disabled', true);
		$('#freq-big-label').css('text-decoration', 'line-through');
		$('#freq-label').css('text-decoration', 'line-through');
	} else {
		$('#archiveFreqSlider').prop('disabled', false);
		$('#freq-big-label').css('text-decoration', 'none');
		$('#freq-label').css('text-decoration', 'none');
	}
}

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
var smartArchiveEnabled;
var zipArchiveEnabled;
var interval = 1800000;
var iv;
loadConfig();

function apply() {
	saveConfig(); // This is gonna be moved to 'else' statement below
	
	if($('#choose-directory-label').text() == 'NO LOCATION SPECIFIED') {
		$('#location-error').show();
	} else {
		startClean();
	}
	//w.hide();
}

function startClean() {
	// savedDate = new Date();
	let w = remote.getCurrentWindow();
	// sliderValue = $('#archiveFreqSlider').val();
	clearInterval(iv);
	if(smartArchiveEnabled) {
		iv = setInterval(checkCleanSmart, 2000); //3600, interval
	} else {
		switch(sliderValue) {
			case '1':
				clean();
				//w.close();
				break;
			case '2':
				// w.close();
				break;
			case '3':
				iv = setInterval(checkClean.bind(null, 20), 2000); //3600, interval
				//w.close();
				break;
			case '4':
				iv = setInterval(checkClean.bind(null, 20), 2000); //86400, interval
				//w.close();
				break;
			case '5':
				iv = setInterval(checkClean.bind(null, 20), 2000); //604800, interval
				//w.close();
				break;
			case '6':
				iv = setInterval(checkClean.bind(null, 20), 2000); //2419200, interval
				//w.close();
				break;
		}
	}
}

function checkCleanSmart() {
	if(shell.ls('~/Desktop').length - exceptionFiles.length > 10) {
		clean();
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

function clean() {
	console.log('SHOULD CLEAR NOW');
	/*
	var currentdate = new Date();
	var datetime = currentdate.getDate() + '-'
				+ (currentdate.getMonth()+1)  + '-' 
				+ currentdate.getFullYear() + '@'  
				+ currentdate.getHours() + '-'
				+ currentdate.getMinutes();

	// var pathToDirectory = $('#choose-directory-label').val(); //$('#choose-directory')[0].files[0].path;
	var pathToArchive = pathToDirectory + '/' + datetime;
	if (process.platform !== 'darwin') {

	} else {
		var shellCommand = 'mv';
		for(var i = 0; i < desktopFiles.length; i++) {
			if($.inArray(desktopFiles[i], exceptionFiles) < 0)
				shellCommand = shellCommand + ' $HOME/Desktop/\'' + desktopFiles[i] + '\'';
		}
		shellCommand = shellCommand + ' ' + pathToArchive + '/';
		console.log(shellCommand);
		shell.exec('mkdir ' + pathToArchive, {async: true});
		shell.exec(shellCommand, {async: true});
		if(zipArchiveEnabled) {
			console.log('cd ' + pathToDirectory + '; zip -r ' + datetime + ' ' + datetime)
			shell.exec('cd ' + pathToDirectory + '; zip -r ' + datetime + ' ' + datetime, {async: true});
			shell.exec('rm -rf ' + pathToArchive, {async: true});
		}
	}
	*/
}

function changeArchiveFrequency(step) {
	switch(step) {
		case '1':
			$('#freq-label').text('Just once');
			break;
		case '2':
			$('#freq-label').text('Every startup');
			break;
		case '3':
			$('#freq-label').text('Once an hour');
			break;
		case '4':
			$('#freq-label').text('Once a day');
			break;
		case '5':
			$('#freq-label').text('Once a week');
			break;
		case '6':
			$('#freq-label').text('Once a month');
			break;
	}
}

function openExceptionsSidebar() {
	$('#exceptions-sidebar').css({width: '300px'});
}

function loadConfig() {
	try {
		pathToDirectory = db.get('archiveLocation').value();
		sliderValue = db.get('sliderValue').value();
		lastTime = db.get('lastTime').value();
		smartArchiveEnabled = db.get('smartArchiveEnabled').value();
		zipArchiveEnabled = db.get('zipArchiveEnabled').value();
		exceptionFiles = db.get('exceptions').value();

		changeArchiveFrequency(sliderValue);
		$('#choose-directory-label').text(pathToDirectory);
		$('#choose-directory-label').val(pathToDirectory);
		$('#archiveFreqSlider').val(sliderValue);

		// Exceptions
		for(var i = 0; i < exceptionFiles.length; i++) {
			$('input[type=checkbox][value="' + exceptionFiles[i] + '"]').prop('checked', true);
		}

		if(smartArchiveEnabled)
			$('#smartArchiveCheckbox').prop('checked', true);
		if(zipArchiveEnabled)
			$('#zipArchiveCheckbox').prop('checked', true);
		smartArchiveCheck();
		applyExceptions();
		startClean();
	} catch(err) {
		if (!err instanceof TypeError) {
			throw err;
		}
	}
	
}

function saveConfig() {
	// Set some defaults (required if your JSON file is empty)
	db.defaults({ archiveLocation: '', exceptions: [], smartArchiveEnabled: false, zipArchiveEnabled: false, sliderValue: 0, lastTime: 0 }).write()

	pathToDirectory = $('#choose-directory-label').text();
	sliderValue = $('#archiveFreqSlider').val();
	lastTime = $.now();
	smartArchiveEnabled = $('#smartArchiveCheckbox').is(':checked');
	zipArchiveEnabled = $('#zipArchiveCheckbox').is(':checked');

	db.set('archiveLocation', pathToDirectory).write();
	db.set('smartArchiveEnabled', smartArchiveEnabled).write();
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