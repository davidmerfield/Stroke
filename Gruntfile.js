
module.exports = function(grunt) {

    grunt.initConfig({
      nodewebkit: {
        options: {
            credits: "./app/credits/index.html",
            build_dir: './builds', 
            mac: true, 
            mac_icns: './app/app.icns',
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
