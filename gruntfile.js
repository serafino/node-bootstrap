module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-exorcise');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jasmine-nodejs');
  grunt.loadNpmTasks('grunt-auto-install');
  grunt.loadNpmTasks('grunt-node-inspector');

  grunt.initConfig({
    auto_install: {
      locals: {},
      options: { stdout: true, stderr: true },
    },

    eslint: { app: ['src', 'tests'] },

    copy: {
      app: { expand: true, cwd: 'src', src: '**', dest: 'build' },
    },

    browserify: {
      app: {
        options: {
          browserifyOptions: {debug: true},
          transform: [['babelify', { presets: ['es2015'] }]],
        },

        src: ['src/client/app.js'],
        dest: 'build/bundle.js',
      }
    },

    exorcise: {
      app: {
        files: { 'build/bundle.js.map': ['build/bundle.js'] },
      }
    },

    uglify: {
      app: {
        options: { sourceMap: true, sourceMapIn: 'build/bundle.js.map' },
        files: { 'build/client/app.min.js': ['build/bundle.js'] },
      }
    },

    karma: {
      app: {
        browsers: ['PhantomJS'],
        frameworks: ['jasmine', 'browserify'],
        options: { files: ['tests/karma/**/*.js'] },

        preprocessors: {
          'tests/karma/**/*.js': ['babel'],
          'tests/karma/**/*.es5.js': ['browserify'],
        },

        babelPreprocessor: {
          options: { presets: ['es2015'], sourceMap: 'inline' },

          filename (file) {
            return file.originalPath.replace(/\.js$/, '.es5.js');
          },

          sourceFileName (file) {
            return file.originalPath;
          },
        },

        phantomjsLauncher: { exitOnResourceError: true },
        singleRun: true,
        logLevel: 'ERROR',
        colors: true,
        reporters: ['spec'],
      },
    },

    jasmine_nodejs: {
      app: { specs: ['tests/node/**'] },
      options: {reporters: {console: {colors: 2}}},
    },

    clean: ['build'],

    express: {
      app: {
        options: {
          port: 3000,
          hostname: 'localhost',
          bases: ['build/client'],
          livereload: true,
          open: true,
        },
      },
    },

    'node-inspector': {
      app: {
        options: {
          'web-port': 5000,
          'debug-port': 5858,
        },
      },
    },

    watch: {
      ui: {
        options: { livereload: true },
        files: ['build/client/**'],
        tasks: [],
      },

      autobuild: { files: ['src/**/*'], tasks: ['build'] },
    },

    nodemon: {
      app: {
        script: 'build/server/__node_Bootstrap_Internals//__startup_Script.js',
        options: { watch: ['build/server'] },
      },

      debug: {
        script: 'build/server/__node_Bootstrap_Internals//__startup_Script.js',
        options: {
          nodeArgs: ['--debug'],
          watch: ['build/server'],
        },
      },
    },

    concurrent: {
      options: { logConcurrentOutput: true },
      run: ['nodemon:app', 'watch:autobuild', 'server'],
      debug: ['nodemon:debug', 'node-inspector', 'watch:autobuild', 'server'],
    },
  });

  grunt.registerTask('all_tests', ['jasmine_nodejs', 'karma']);
  grunt.registerTask('build', ['eslint', 'copy', 'browserify', 'exorcise', 'uglify', 'all_tests']);
  grunt.registerTask('rebuildAll', ['clean', 'auto_install', 'build']);

  grunt.registerTask('test', ['rebuildAll']); // everything must be rebuilt before testing;
                                              // and, rebuildAll already runs the tests

  grunt.registerTask('server', ['express', 'watch:ui']);
  grunt.registerTask('run', ['rebuildAll', 'concurrent:run']);
  grunt.registerTask('debug', ['rebuildAll', 'concurrent:debug']);
  grunt.registerTask('default', ['run']);
};
