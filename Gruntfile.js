/* eslint-disable */

module.exports = (grunt) => {
  // load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // time how long tasks take. can help when optimizing build times
  require('time-grunt')(grunt);

  grunt.loadTasks('grunt');
};
