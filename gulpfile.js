var gulp = require('gulp');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var clean = require('gulp-clean');

gulp.task('jshint', function(){
	return gulp.src('./dev/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('clean', function(){
	return gulp.src('./dist/inspect.min.js')
		.pipe(clean());
})

gulp.task('dist', ['clean'], function(){
	return gulp.src('./dev/*.js')
		.pipe(uglify())
		.pipe(concat('inspect.min.js'))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['jshint', 'dist']);