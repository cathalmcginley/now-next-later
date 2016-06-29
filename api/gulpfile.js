var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  del = require('del');

gulp.task('clean', function() {    
    return del([
	'**/*~',
	'**/*.bak'
    ]);
});

gulp.task('develop', function () {
    livereload.listen();
    nodemon({
	script: 'bin/www',
	ext: 'js hbs',
	stdout: false
    }).on('readable', function () {
	this.stdout.on('data', function (chunk) {
	    if(/^Express server listening on port/.test(chunk)){
		livereload.changed(__dirname);
	    }
	});
	this.stdout.pipe(process.stdout);
	this.stderr.pipe(process.stderr);
    });
});

gulp.task('default', ['develop']);
