var config = {};

var paths = {
    app: 'app',
    dist: 'dist',
    bower: 'bower_components'
};

var files = {
    jslibs: [
        paths.bower + '/angular/angular.js',
        paths.bower + '/angular/angular.js',
        paths.bower + '/angular-bootstrap/ui-bootstrap.js',
        paths.bower + '/angular-bootstrap/ui-bootstrap-tpls.js',
        paths.bower + '/angular-ui-router/release/angular-ui-router.js',
        paths.bower + '/jquery/dist/jquery.js',
        paths.bower + '/bootstrap-sass-official/assets/javascripts/bootstrap.js',
        paths.bower + '/spinjs/spin.js'
    ],
    jsapp: [
        paths.app + '/js/app.js',
        paths.app + '/js/services.js',
        paths.app + '/js/controllers.js',
        paths.app + '/js/directives.js',
        paths.app + '/js/filters.js',
        paths.app + '/js/main.js'
    ],
    css: [
        paths.bower + '/font-awesome/css/font-awesome.css'
    ],
    scss: paths.app + '/scss/*.scss',
    fonts: [
        paths.bower + '/bootstrap-sass-official/assets/fonts/bootstrap/*',
        paths.bower + '/font-awesome/fonts/*',
        paths.app + '/fonts/*'
    ],
    other: [
        paths.bower + '/modernizr/modernizr.js'
    ],
    images: [
        paths.app + '/images/*'
    ]
};

config.paths = paths;
config.files = files;

module.exports = config;