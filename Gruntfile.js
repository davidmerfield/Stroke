
module.exports = function(grunt) {

    grunt.initConfig({
      nodewebkit: {
        options: {
            credits: "./app/credits.html",
            build_dir: './builds', 
            mac: true, 
            mac_icns: './app/Typewriter.icns',
            win: false, 
            linux32: false,
            linux64: false 
        },
        src: ['./app/**/*'] 
      },
    })

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    
    grunt.registerTask('default', 'nodewebkit');
    
};
