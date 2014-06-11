module.exports = function(grunt) {

    banner = [
        '/**',
        ' * @license',
        ' * <%= pkg.name %> - v<%= pkg.version %>',
        ' * Copyright (c) 2014, Serj Narbut',
        ' *',
        ' * Compiled: <%= grunt.template.today("yyyy-mm-dd") %>',
        ' *',
        ' * <%= pkg.name %> is licensed under the <%= pkg.license %> License.',
        ' * <%= pkg.licenseUrl %>',
        ' */',
        ''
    ].join('\n');


    grunt.initConfig({
        pkg : grunt.file.readJSON("package.json"),

        concat:{
            options: {
                banner: banner
            },

            dist:{
                src:[
                    'src/steerjs/Intro.txt',
                    'src/steerjs/Steerjs.js',
                    'src/steerjs/core/Injector.js',
                    'src/steerjs/algo/Algo.js',
                    'src/steerjs/core/Vector.js',
                    'src/steerjs/core/AlgorithmRunner.js',
                    'src/steerjs/core/EventHandler.js',
                    'src/steerjs/core/Module.js',
                    'src/steerjs/Loader.js',
                    'src/steerjs/Outro.txt'
                ],
                dest: 'build/<%= pkg.name %>.js'
            }
        },

        uglify: {
            options: {
                banner: banner
            },

            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },

        karma:{
            unit:{
                configFile:"karma.conf.js"
            }
        }


    });


    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-karma");

    grunt.registerTask("default", ['concat','uglify']);
    grunt.registerTask("test",['karma']);
};
