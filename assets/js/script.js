const fs = require('fs')
const app = remote.app;
/* TESTING FILE SAVING - WORKS */ /*
const fs = require('fs')
const app = remote.app;

console.log(app.getPath('userData'))
const configName = 'config.txt';

// LOAD
var content = fs.readFileSync(app.getPath('userData')+'/config.txt', 'utf-8'); */
/* TESTING FILE SAVING - WORKS */

var $ = jQuery = require("jquery")
var shell = require('shelljs');
shell.config.execPath = shell.which('node');

const configName = 'config.txt';
const tippy = require('tippy.js')
tippy('label');

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
if (process.platform !== 'darwin') {

} else {
	desktopFiles = shell.ls('~/Desktop');
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
var interval = 1800000;
var iv;
loadConfig();

function apply() {
	saveConfig(); // This is gonna be moved to 'else' statement below
	
	if($('#choose-directory-label').text() == 'NO LOCATION SPECIFIED') {
		$('#location-error').show();
	} else {
		// savedDate = new Date();
		let w = remote.getCurrentWindow();
		// sliderValue = $('#archiveFreqSlider').val();
		clearInterval(iv);
		switch(sliderValue) {
			case '1':
				clean();
				w.close();
				break;
			case '2':
				w.close();
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
	}
	savedDate = currentDate;
	*/
}

function changeArchiveFrequency(step) {
	switch(step) {
		case '1':
			$('#freq-label').text('Never');
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
		var configContent = fs.readFileSync(app.getPath('userData') + '/' + configName, 'utf-8');
		pathToDirectory = configContent.split(':')[0];
		sliderValue = configContent.split(':')[1];
		lastTime = Number(configContent.split(':')[2]);

		changeArchiveFrequency(sliderValue);
		$('#choose-directory-label').text(pathToDirectory);
		$('#choose-directory-label').val(pathToDirectory);
		$('#archiveFreqSlider').val(sliderValue);

		// Exceptions
		var exceptionsConfigContent = fs.readFileSync(app.getPath('userData') + '/' + 'exceptions_' + configName, 'utf-8');
		var exceptionFiles = exceptionsConfigContent.split(':');
		for(var i = 0; i < exceptionFiles.length; i++) {
			$('input[type=checkbox][value="' + exceptionFiles[i] + '"]').prop('checked', true);
		}
		applyExceptions();
	} catch(err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}
	
}

function saveConfig() {
	pathToDirectory = $('#choose-directory-label').val();
	sliderValue = $('#archiveFreqSlider').val();
	lastTime = $.now();
	configContent = pathToDirectory + ':' + sliderValue + ':' + lastTime + ':';
	fs.writeFile(app.getPath('userData') + '/' + configName, configContent, function (err) {});
	var exceptionsConfigContent = '';
	for(var i = 0; i < exceptionFiles.length; i++) {
		console.log(exceptionFiles[i]);
		exceptionsConfigContent += exceptionFiles[i] + ':';
	}
	fs.writeFile(app.getPath('userData') + '/' + 'exceptions_' + configName, exceptionsConfigContent, function (err) {});
	console.log('SAVED');
}