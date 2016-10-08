import zip from 'gulp-zip';
import del from 'del';
import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import uglify from 'gulp-uglify';
import stripDebug from 'gulp-strip-debug'; // remove js debug code
import htmlmin from 'gulp-htmlmin';
import babelify from 'babelify';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import spritesmith from 'gulp.spritesmith';
import merge from 'merge-stream';
import source from 'vinyl-source-stream';
import imagemin from 'gulp-imagemin';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import runSequence from 'run-sequence';
import nunjucksRender from 'gulp-nunjucks-render';

// internal imports
import {config as src}  from './config';

const dist = 'dist';
const scssDist = dist + '/assets/css';
const jsDist = dist + '/assets/js';
const fontsDist = dist + '/assets/fonts';

// Compile sass into CSS
gulp.task('sassmin', () =>
	gulp.src(src.scss)
		.pipe(sass({ includePaths: [
				'./node_modules/bootstrap/scss/',
				'./node_modules/sweetalert/dev'
			]
		})).on('error', function (err) { console.error(err.message); })
    .pipe(sourcemaps.init())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write())
		.pipe(gulp.dest(scssDist))
);

// create sprites for icons and placeholders
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
    .pipe(gulp.dest('./src/scss/vendors/'));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

// images optimization
gulp.task('imagemin', () =>
  gulp.src(src.img)
    .pipe(imagemin())
    .pipe(gulp.dest(dist + '/assets/images'))
);

// html minification
gulp.task('htmlmin', () =>
  gulp.src(src.nunjucks)
  	.pipe(nunjucksRender({
      path: [src.templates]
    }))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(dist))
);

// compile and optimizate js
gulp.task('jsmin', ['js'], () => {
  return gulp.src(src.jsDist + '/app.js' )
    .pipe(sourcemaps.init())
    .pipe(stripDebug())
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(jsDist));
});

// copy fonts to webroot
gulp.task('fonts', () => {
  return gulp.src(src.fonts)
  	// output files in src folder
	  .pipe(gulp.dest(fontsDist));
});

gulp.task('clean', () =>
	del([dist, dist + '/dist.zip'])
)

gulp.task('zip', () =>
  gulp.src(dist + '/**/*')
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'))
);

gulp.task('build', (cb) => {
	// This will run in this order:
	// * compile pages
	// * create sprites
	// * copy fonts
	// * sass-min, imagemin, htmlmin in parallel
	// * zip
	// * Finally call the callback function
  runSequence('clean', 'sprite', ['fonts', 'sassmin', 'jsmin', 'imagemin', 'htmlmin'], 'zip', cb);
});
