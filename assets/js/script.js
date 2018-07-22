var $ = jQuery = require("jquery")
var shell = require('shelljs');
shell.config.execPath = shell.which('node');

const tippy = require('tippy.js')
tippy('label');

var exceptionFiles = [];
var desktopFiles = [];

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
                    <input type="checkbox" class="exception-checkbox" value="' + desktopFiles[i] + '">\
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

function clean() {
	var currentdate = new Date();
	var datetime = currentdate.getDate() + '-'
				+ (currentdate.getMonth()+1)  + '-' 
				+ currentdate.getFullYear() + '@'  
				+ currentdate.getHours() + '-'
				+ currentdate.getMinutes();


	var pathToDirectory = $('#choose-directory')[0].files[0].path;
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