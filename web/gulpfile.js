var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  stylus = require('gulp-stylus'),
  del = require('del');


var bower = require('gulp-bower');

var config = {
  stylePath: './public/css',
  bowerDir: './public/components' 
}

gulp.task('bower', function() { 
    return bower()
         .pipe(gulp.dest(config.bowerDir)) 
});


gulp.task('clean', function() {
    return del([
	'**/*~',
	'**/*.bak'
    ]);
});

//gulp.task('bootstrap', function() {
//   console.log("Foo...");
//   var x = config.bowerDir + "/bootstrap-stylus/bootstrap/*.styl";
//   console.log(x);
//   gulp.src(x)
//     .pipe(plumber())
//     .pipe(stylus())
//     .pipe(gulp.dest(config.stylePath + "/bootstrap"))
//     .pipe(livereload());
// });

gulp.task('stylus', function () {
  gulp.src('./public/css/*.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload({port:35730}));
});

gulp.task('watch', function() {
  gulp.watch('./public/css/*.styl', ['stylus']);
});

gulp.task('develop', function () {
  livereload.listen({port:35730});
  nodemon({
    script: 'bin/www',
    ext: 'js handlebars coffee',
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

gulp.task('default', [
  'stylus',
  'develop',
  'watch'
]);
