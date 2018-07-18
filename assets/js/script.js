var $ = jQuery = require("jquery")
var shell = require('shelljs');
shell.config.execPath = shell.which('node');

var exceptions;

// Green button to apply all chosen exceptions
function applyExceptions() {
	exceptions = document.querySelectorAll('input[class=exception-checkbox]:checked');
	cancelModal();
}

// Red button to cancel and leave modal
function cancelModal() {
	$('.modal').hide('slow');
}

// Desktop files and folders to exception list
if (process.platform !== 'darwin') {

} else {
	var desktopFiles = shell.ls('~/Desktop');
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
		shell.exec('mkdir ' + pathToArchive, {async: true});
		shell.exec('mv $HOME/Desktop/* ' + pathToArchive, {async: true});
	}
}