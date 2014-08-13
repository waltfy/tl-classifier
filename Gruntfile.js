module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          port: 9001,
          base: 'demo'
        }
      }
    },
    browserify:     {
      options: {
        transform: [ require('grunt-react').browserify ]
      },
      app: {
        src: ['demo/jsx/react-radiogroup.jsx', 'demo/jsx/app.jsx'],
        dest: 'demo/main.js'
      }
    },
    watch: {
      library: {
        files: 'lib/*.js',
        tasks: ['browserify'],
        options: {
          livereload: true,
        },
      },
      scripts: {
        files: 'demo/jsx/*.jsx',
        tasks: ['browserify'],
        options: {
          livereload: true,
        },
      },
      html: {
        files: 'demo/*.html',
        options: {
          livereload: true,
        },
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

  // Default task(s).
  grunt.registerTask('default', ['browserify', 'connect:server', 'watch']);

};