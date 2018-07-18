var $ = jQuery = require("jquery")
var shell = require('shelljs');
shell.config.execPath = shell.which('node');

var exceptionFiles = [];
var desktopFiles = [];

// Green button to apply all chosen exceptions
function applyExceptions() {
	var exceptions = document.querySelectorAll('input[class=exception-checkbox]:checked');
	for(var i = 0; i < exceptions.length; i++) {
		exceptionFiles[i] = exceptions[i].value
	}
	$('#exceptions-label').text(exceptions.length + ' exceptions selected');
	cancelModal();
}

// Red button to cancel and leave any modal
function cancelModal() {
	$('.modal').hide('slow');
}

function showModal(modalId) {
	$('#' + modalId).show('slow');
}

// Desktop files and folders to exception list
if (process.platform !== 'darwin') {

} else {
	desktopFiles = shell.ls('~/Desktop');
	for(var i = 0; i < desktopFiles.length; i++) {
		$('#exceptions-content').append('\
			<label class="exception-item">\
				' + desktopFiles[i] + '\
				<input type="checkbox" class="exception-checkbox" value="' + desktopFiles[i] + '">\
				<span class="exception-checkmark"></span>\
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