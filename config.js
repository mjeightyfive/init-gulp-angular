var pkg = require('./package.json'),
    config = {};

var paths = {
    app: 'app',
    dist: 'dist',
    bower: 'bower_components'
};

var files = {
    js: [
        paths.bower + '/angular/angular.js',
        paths.bower + '/angular-bootstrap/ui-bootstrap.js',
        paths.bower + '/angular-bootstrap/ui-bootstrap-tpls.js',
        paths.bower + '/angular-ui-router/release/angular-ui-router.js',
        paths.bower + '/jquery/dist/jquery.js',
        paths.bower + '/spinjs/spin.js',
        paths.app + '/js/app.js',
        paths.app + '/js/services.js',
        paths.app + '/js/controllers.js',
        paths.app + '/js/directives.js',
        paths.app + '/js/filters.js',
        paths.app + '/js/main.js'
    ],
    css: [
        // bower / libraries etc.
        paths.bower + '/bootstrap/dist/css/bootstrap.css',
        // compiled from scss
        paths.dist + '/css/style.css'
    ],
    scss: paths.app + '/scss/*.scss',
    fonts: [
        paths.app + '/fonts/*'
    ],
    other: [
        paths.bower + '/modernizr/modernizr.js'
    ],
    images: [
        paths.app + '/images/*'
    ]
};

var ignoredCssClasses = [
    /:hover/,
    /:active/,
    /:visited/,
    /:focus/,
    /:checked/,
    /.active/,
    /.open/
];

var autoprefixer_browsers = [
    'ie >= 9',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
];

var templateopts = {
    name: pkg.name,
    author: pkg.author
};

var htmlopts = {
    empty: true,
    quotes: true,
    conditionals: true,
    spare: true
};

config.paths = paths;
config.files = files;
config.autoprefixer_browsers = autoprefixer_browsers;
config.templateopts = templateopts;
config.htmlopts = htmlopts;
config.ignoredCssClasses = ignoredCssClasses;

module.exports = config;