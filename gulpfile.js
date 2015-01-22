'use strict';

var gulp = require('gulp'),
    glob = require('glob'),
    $ = require('gulp-load-plugins')(),
    del = require('del'),
    sequence = require('run-sequence'),
    streamqueue = require('streamqueue'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;

var config = require('./config.js'),
    live = $.util.env.live;

if (!live) {
    live = false;
}

gulp.task('clean', del.bind(null, [config.paths.dist]));

gulp.task('default', ['clean'], function() {
    sequence([
            'styles',
            'scripts',
            'fonts',
            'images',
            'files'
        ],
        'html',
        'serve'
    );
});

gulp.task('html', function() {

    var assets = {};

    if (live) {
        assets.css = gulp.src([config.paths.dist + '/css/style.css']);
        assets.js = gulp.src([config.paths.dist + '/js/scripts.js']);
    } else {
        assets.css = gulp.src(config.files.css);
        assets.js = gulp.src(config.files.js);
    };

    gulp.src(config.paths.app + '/**/*.html')
        .pipe($.inject(assets.css, {
            transform: function(filepath, file) {
                arguments[0] = file.path.replace(file.base, 'css/');
                return $.inject.transform.apply($.inject.transform, arguments);
            }
        }))
        .pipe($.inject(assets.js, {
            transform: function(filepath, file) {
                arguments[0] = file.path.replace(file.base, 'js/');
                return $.inject.transform.apply($.inject.transform, arguments);
            }
        }))
        .pipe($.template(config.templateopts))
        .pipe($.
            if (live, $.minifyHtml(config.htmlopts)))
        .pipe(gulp.dest(config.paths.dist))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('styles', function() {

    return streamqueue({
            objectMode: true
        },
        gulp.src(config.files.css)
        .pipe($.sourcemaps.init())
        .pipe($.sourcemaps.write()),
        gulp.src(config.files.scss)
        .pipe($.changed('css', {
            extension: '.scss'
        }))
        .pipe($.sourcemaps.init())
        .pipe($.sass({
                outputStyle: 'expanded',
                sourcemap: true,
                sourcemapPath: config.files.scss
            })
            .on('error', function(err) {
                $.util.log('Sass error: ', $.util.colors.red(err.message));
                $.util.beep();
                this.emit('end');
            }))
        .pipe($.sourcemaps.write())
    )
        .pipe($.
            if (live, $.concat('style.css')))
        .pipe($.
            if (live, $.uncss({
                html: glob.sync(config.paths.app + '/**/*.html'),
                ignore: config.ignoredCssClasses
            })))
        .pipe($.autoprefixer(config.autoprefixer_browsers))
        .pipe($.
            if (live, $.csso({
                keepSpecialComments: 0
            })))
        .pipe(gulp.dest(config.paths.dist + '/css'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('scripts', function() {

    gulp.src(config.files.js)
        .pipe($.changed(config.paths.dist))
        .pipe($.
            if (live, $.concat('scripts.js')))
        .pipe($.
            if (live, $.uglify()))
        .pipe($.
            if (live, $.size({
                showFiles: true
            })))
        .pipe(gulp.dest(config.paths.dist + '/js'))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('fonts', function() {
    return gulp.src(config.files.fonts)
        .pipe(gulp.dest(config.paths.dist + '/fonts'))
        .pipe($.size({
            title: 'fonts'
        }));
});

gulp.task('images', function() {
    return gulp.src(config.paths.app + '/images/**/*')
        .pipe($.cached($.imagemin({
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest(config.paths.dist + '/images'))
        .pipe($.size({
            title: 'images',
            showFiles: true
        }));
});

gulp.task('files', function() {
    gulp.src(config.files.other)
        .pipe(gulp.dest(config.paths.dist + '/files'));
});

gulp.task('serve', function() {
    browserSync({
        notify: true,
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: {
            baseDir: config.paths.dist
        }
    });

    gulp.watch([config.paths.app + '/**/*.html'], ['html']);
    gulp.watch([config.paths.app + '/scss/**/*.scss'], ['styles']);
    gulp.watch([config.paths.app + '/js/**/*.js'], ['scripts']);
    gulp.watch([config.paths.app + '/images/**/*'], ['images']);
    gulp.watch([config.paths.app + '/files/**/*'], ['files']);

});

gulp.task('jshint', function() {
    return gulp.src(config.paths.app + '/js/**/*.js')
        .pipe(reload({
            stream: true,
            once: true
        }))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.
            if (!browserSync.active, $.jshint.reporter('fail')));
});