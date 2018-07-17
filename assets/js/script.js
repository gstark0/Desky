var $ = jQuery = require("jquery")

// For custom file input
$('#choose-directory').change(function() {
	var i = $(this).prev('label').clone();
	var file = $('#choose-directory')[0].files[0].path;
	$(this).prev('label').text(file);
});

function clean() {
	var shell = require('shelljs');
	shell.config.execPath = shell.which('node');

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