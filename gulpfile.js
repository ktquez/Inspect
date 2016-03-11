var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	jshint = require('gulp-jshint');
	concat = require('gulp-concat');

gulp.task('dist', function(){
	gulp.src('./dev/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(concat('inspect.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./dist/'));
});