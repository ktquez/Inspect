var gulp = require('gulp'),
	clean = require('gulp-clean'),
	watch = require('gulp-watch'),
	browserSync = require('browser-sync'),
	/*
	stripDebug = require('gulp-strip-debug'),
	uglify = require('gulp-uglify'),
	*/
	concat = require('gulp-concat'),
	csswring = require('csswring'),
	prefix = require('autoprefixer'),
	postcss = require('gulp-postcss'),
	nested = require('postcss-nested'),
	cssnext = require('cssnext');

var src = './src/',
	dest = './assets/';

/**
 * JS

gulp.task('script', function(){
	return gulp.src(src + 'js/*.js')
		.pipe(stripDebug())
		.pipe(uglify())
		.pipe(concat('script.min.js'))
		.pipe(clean(dest + '*.js'))
		.pipe(gulp.dest(dest));
});

gulp.task('script-watch', ['script'], browserSync.reload);

 */

/**
 * Style
 */
gulp.task('style', function(){
	var processors = [
		prefix(),
		cssnext(),
		nested,
		csswring
	];

	return gulp.src([src + 'styles/noDoubt.css', src + 'styles/main.css'])
		.pipe(postcss(processors))
		.on('error', function(){
			this.emit('end');
		})
		.pipe(concat('style.min.css'))
		.pipe(clean(dest + '*.css'))
		.pipe(gulp.dest(dest));
});

/*----*/

gulp.task('style-watch', ['style'], browserSync.reload);

gulp.task('serve', ['style'], function() {

	browserSync.init({
		server: {
			baseDir: './'
		}
	});

	gulp.watch('./*.html').on('change', browserSync.reload);
	gulp.watch(src + '**/*.css', ['style-watch']);
	//gulp.watch(src + '**/*.js', ['script-watch']);

});

gulp.task('default', ['serve']);
