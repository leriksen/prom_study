module.exports = function(grunt) {

    grunt.initConfig({
        coffee: {
            options: {
                sourceMap: true
            },
            application: {
                expand: true,
                cwd: "src",
                src: ['*.coffee'],
                dest: 'js',
                ext: '.js'
            }
        },
        watch: {
            coffeescript: {
                files: ["src/**/*.coffee"],
                tasks: ["newer:coffee", "mochaTest"]
            },
            test: {
                files: ["src/**/*.coffee", "test/**/*.coffee"],
                tasks: ["newer:mochaTest"]
            }
        },
        mochaTest: {
            test: {
                src: ['test/**/*.coffee']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-newer');

    grunt.registerTask('default', 'coffee');
};

