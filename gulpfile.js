var gulp = require('gulp'),
	sass = require('gulp-sass'),
	autoprefixer = require('gulp-autoprefixer'),
	prettify = require('gulp-prettify'),
	minifyCSS = require('gulp-minify-css'),
	uglify = require('gulp-uglify'),
	clean = require('gulp-rimraf'),
	useref = require('gulp-useref'),
	gulpif = require('gulp-if'),
	jade = require('gulp-jade'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload,
	wiredep = require('wiredep').stream;

// jade
gulp.task('jade', function() {
	gulp.src(['./app/jade/*.jade', '!./app/jade/_*.jade'])
		.pipe(jade({
			pretty: true
		}))
		.pipe(prettify({indent_size: 2}))
		.pipe(gulp.dest('./app/'))
		.pipe(reload({stream: true}));
});

// bower
gulp.task('wiredep', function () {
	gulp.src('./app/jade/*.jade')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)*\.\.\//
		}))
		.pipe(gulp.dest('./app/jade/'))
});

// server
gulp.task('server', ['jade'], function () {
	browserSync({
		notify: false,
		port: 9000,
		server: {
		    baseDir: 'app'
		}
	});
});

// sass
gulp.task('sass', function() {
	return gulp.src('./app/scss/*.scss')
		.pipe(sass({
			noCache: true,
			style: "expanded",
			lineNumbers: true,
			errLogToConsole: true
		}))
		.pipe(autoprefixer({
			browsers: ['last 2 versions', 'ie 8', 'ie 9'],
			cascade: false
		}))
		.pipe(gulp.dest('./app/css'));
});


// watcher
gulp.task('watch', function () {
	gulp.watch('./app/jade/**/*.jade', ['jade']);
	gulp.watch('bower.json', ['wiredep']);
	gulp.watch('./app/js/coffee/*.coffee', ['coffee']);
	gulp.watch('./app/scss/*.scss', ['sass']);
	gulp.watch([
		'./app/js/**/*.js',
		'./app/*.html',
		'./app/css/*.css'
	]).on('change', reload);
});

// default task
gulp.task('default', ['server', 'watch']);

// Build
var path = {
	build: {
		html: './dist/',
		js: './dist/js/',
		plugins: './dist/plugins/',
		img: './dist/img/',
		font: './dist/font/'
	},
	src: {
		html: './app/*.html',
		php: './app/*.php',
		js: './app/js/.js',
		plugins: './app/plugins/**/*.*',
		img: './app/img/**/*.*',
		font: './app/font/**/*.*'
	},
	clean: './dist'
};

gulp.task('html:build', function () {
	var assets = useref.assets();
	return gulp.src(path.src.html)
		.pipe(assets)
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', minifyCSS({compatibility: 'ie8'})))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest(path.build.html));
});

gulp.task('php:build', function () {
	gulp.src(path.src.php)
		.pipe(gulp.dest(path.build.html));
});

gulp.task('js:build', function () {
	gulp.src(path.src.js)
		.pipe(gulp.dest(path.build.js));
	gulp.src(path.src.plugins)
		.pipe(gulp.dest(path.build.plugins));
});

gulp.task('img:build', function () {
	gulp.src(path.src.img)
		.pipe(gulp.dest(path.build.img));
});

gulp.task('font:build', function() {
	gulp.src(path.src.font)
		.pipe(gulp.dest(path.build.font));
});

gulp.task('extra:build', function () {
	return gulp.src([
		'./app/*.txt',
		'./app/*.png'
	]).pipe(gulp.dest('./dist/'));
});

// build cleaner
gulp.task('clean', function () {
	return gulp.src('./dist/**/*.*', {read: false})
		.pipe(clean());
});

gulp.task('build', ['html:build','php:build','js:build','img:build','font:build', 'extra:build']);
