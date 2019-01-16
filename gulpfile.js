'use strict';

var gulp = require('gulp');
var electron = require('electron-connect').server.create();

gulp.task('serve', function () {

  // Start browser process
  electron.start();

  // Restart browser process
  gulp.watch(['src/electron/app.js', 'src/electron/app_menu.js'], electron.restart);

  // Reload renderer process
  gulp.watch(['src/js/index.js', 'src/js/tab.js', 'src/css/*.css', 'src/view/*.html'], electron.reload);
});

gulp.task('reload:browser', function () {
  // Restart main process
  electron.restart();
});

gulp.task('reload:renderer', function () {
  // Reload renderer process
  electron.reload();
});

// gulp.task('default', ['serve']);