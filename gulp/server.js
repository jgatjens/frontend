// lib imports
import gulp from 'gulp';
import path from 'path';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import spritesmith from 'gulp.spritesmith';
import autoprefixer from 'gulp-autoprefixer';
import nunjucksRender from 'gulp-nunjucks-render';
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import merge from 'merge-stream';
import source from 'vinyl-source-stream';

import { create } from 'browser-sync';
// internal imports
import {config as src}  from './config';

let browserSync = create();
const reload = browserSync.reload;

// Static Server + watching scss/html files
gulp.task('serve', ['sprite', 'nunjucks', 'sass', 'js'], () => {

	browserSync.init({
		server: src.root
	});

	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('src/js/**/*', ['js']);
	gulp.watch(['src/templates/**/*.html', 'src/pages/**/*.html'], ['nunjucks']);
	gulp.watch(src.html).on('change', reload);
});

gulp.task('nunjucks', () => {
  // Gets .html and .nunjucks files in pages
  return gulp.src(src.nunjucks)
	  // Renders template with nunjucks
	  .pipe(nunjucksRender({
	    path: [src.templates]
	  }))
	  // output files in app folder
	  .pipe(gulp.dest(src.root));
});

gulp.task('js', () => {

	  let stream = browserify({
        entries: src.jsSrc,
        debug: true,
        transform: [babelify.configure({presets: ["es2015"]})]
    });

    return stream.bundle()
       		  .on('error', function (err) { console.error(err.message); })
        		.pipe(source('app.js'))
        		.pipe(buffer())
				    .pipe(gulp.dest(src.jsDist))
						// .pipe(notify("Successfully built js file!"))
				    .pipe(reload({stream: true}));
});

gulp.task('sprite', function () {
  let spriteData = gulp.src(src.sprite).pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../images/sprite.png',
    cssName: '_sprite.scss'
  }));

  // Pipe image stream through image optimizer and onto disk
  let imgStream = spriteData.img
    .pipe(gulp.dest(src.spriteDist));

  // Pipe CSS stream through CSS optimizer and onto disk
  let cssStream = spriteData.css
  	.pipe(notify("Successfully sprite build!"))
    .pipe(gulp.dest('./src/scss/vendors/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

// Compile sass into CSS
gulp.task('sass', () => {
	return gulp.src(src.scss)
		.pipe(plumber({errorHandler: notify.onError({
	    message: 'Sass error',
	    icon: path.join(__dirname, 'sass.png'),
	    title: '',
	    logLevel: 0,
	    onLast: true
	  })}))
		.pipe(sass({ includePaths: [
				'./node_modules/bootstrap/scss/',
				'./node_modules/sweetalert/dev'
			]
		})).on('error', function (err) { console.error(err.message); })
		.pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false
    }))
		.pipe(gulp.dest(src.scssDist))
		.pipe(reload({stream: true}));
});

gulp.task('default', ['serve']);
