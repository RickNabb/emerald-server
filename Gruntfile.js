module.exports = function (grunt) {

  grunt.initConfig({
    ts: {
      default: {
        tsconfig: "./tsconfig.json"
      }
    },
    babel: {
      options: {
        sourceMap: false,
        "plugins": ["transform-async-to-generator"],
        "presets": ["es2015"]
      },
      dist: {
        files: [{
          expand: true,
          src: ['**/*.js'],
          dest: 'dist/babel/',
          cwd: 'dist/js'
        }]
      }
    },
    clean: ['dist']
  });

  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'ts', 'babel']);
};