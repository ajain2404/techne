const gulp = require('gulp');
const nunjucks = require('gulp-nunjucks-html');
const data = require('gulp-data');
const handleErrors = require('../lib/handleErrors');
const debug = require('gulp-debug');
const yargs = require('yargs');
const requireDir = require('require-dir')

const docsData = require('../lib/data');

let environment = require('../lib/environment')

//DATA
const paths = {
	src: {
		root: './docs',
		data: './docs/data',
		html: './docs/styleguide',
		layouts: './docs/styleguide/templates',
		includes: './docs/styleguide/includes',
		macros: './docs/styleguide/macros',
        components: './src/templates'
	},
	dest: {
		root: './www'
	}
}

/*
compiles nunjucks templates
    serves as primitive controller to inject data into templates
    app = app.json data file
    page = <page_key>.json data file
    components = src/data/<component>.json data files (assembled above)
*/
const buildDocs = () => {
    //these simply create the objects for the templates
    const setAppData = function(file) {
        var app = docsData.getDocsAppData(file);
        return { app: app }
    };
    const setPageData = function(file) {
        var page = docsData.getDocsPageData(file);
        return { page: page }
    };
    const setLinkPath = (file) => {
        //TODO: improve this to avoid hardcoding directories
        var isSecondLevel = false;
        if (file.path.includes('/components/')) {
            isSecondLevel = true;
        }
        var linkpath = isSecondLevel ? '../' : '';
        return { linkpath: linkpath }
    }

    //only process main HTML files, not includes, templates, or macros
	return gulp.src([`${paths.src.html}/**/*.html`, `!${paths.src.layouts}/**/*`, `!${paths.src.includes}/**/*`, `!${paths.src.macros}/**/*` ])
        .pipe(data(setPageData))
        .pipe(data(setAppData))
        .pipe(data(setLinkPath))
		.pipe(nunjucks({
			searchPaths: [paths.src.layouts, paths.src.includes, paths.src.macros, paths.src.components],
			locals: {
                components: docsData.getDocsComponentData(),
				date: new Date(),
				env: environment.production ? 'production':'development',
				debug: environment.debug,
			}
		}))
        .on('error', function(err) {
            // err is the error thrown by the Nunjucks compiler.
            handleErrors(err);
        })
		//.pipe(debug())
        .pipe(gulp.dest(paths.dest.root))
}

gulp.task('docs-html', buildDocs);
module.exports = buildDocs;
