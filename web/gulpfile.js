var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  babel = require('gulp-babel'),
//sourcemaps = require('gulp-sourcemaps'),
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

gulp.task('stylus', function () {
  gulp.src('./public/css/*.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest('./public/css'))
    .pipe(livereload({port:35730}));
});

gulp.task('watch', function() {
  gulp.watch('./public/css/*.styl', ['stylus']);
  gulp.watch('./src/**/*.js', ['babel']);
});

/*
 * Use Babel compiler to convert front-end JavaScript from
 * ES6 to ES5 (more widely supported in browsers)
 */
gulp.task('babel', function() {
   return gulp.src("src/**/*.js")
//    .pipe(sourcemaps.init())
    .pipe(babel())
//    .pipe(concat("all.js"))
//    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("public/js/gen"));
});

gulp.task('develop', function () {
  livereload.listen({port:35730});
  nodemon({
    script: 'bin/www',
    ext: 'js handlebars hbs coffee',
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
  'babel',
  'develop',
  'watch'
]);
