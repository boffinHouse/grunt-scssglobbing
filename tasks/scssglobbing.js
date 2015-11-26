/*
 * grunt-scssglobbing
 * https://github.com/boffinHouse/grunt-scssglobbing
 *
 * Task to generate sass-globbing
 *
 * Copyright (c) 2015 boffinHouse
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.registerMultiTask( 'scssglobbing', '', function() {
    this.files.forEach(function(file){
      file.src.filter(function(globFile) {

        var files, replaceContent, importMatches;
        var dir = globFile.split('/');
        var filename = dir.pop();
        var resultContent = grunt.file.read( globFile );

        if(!/^_+/.test(filename)){
          grunt.fail.warn('file has to start with at least one underscore (_):  "' + filename + '".');
        }

        dir = dir.join('/') + '/';

        //get rid of ../../-prefix, since libsass does not support them in @import-statements+includePaths option
        //resultContent = resultContent.replace( /\"\.\.\/\.\.\//g, '"' );
        importMatches = resultContent.match( /^@import.+\*.*$/mg );

        if( importMatches ) {
          importMatches.forEach( function(initialMatch) {
            // remove all " or '
            var match = initialMatch.replace( /["']/g, '' );
            // remove the preceeding @import
            match = match.replace( /^@import/g, '' );
            // lets get rid of the final ;
            match = match.replace( /;$/g, '' );
            // remove all whitespaces
            match = match.trim().split(/\s*,*\s+/g);
            // get all files, which match this pattern
            files = grunt.file.expand(
                {
                  'cwd': dir,
                  'filter': 'isFile'
                },
                match
            );

            replaceContent = [];

            files.forEach( function(matchedFile) {
              replaceContent.push( '@import "' + matchedFile + '";' );
            } );

            resultContent = resultContent.replace( initialMatch, replaceContent.join( "\n" ) );
          });
        }
        grunt.file.write( dir + 'tmp_'+ (filename.replace(/^_+/, '')), resultContent );
      });
    });
  });
};

