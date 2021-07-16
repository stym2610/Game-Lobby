const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
	'pacman' : './pacman/pacman.js',  
	'flappy' : './flappy/flappy.js'
  }, 
  plugins: [
   new CopyWebpackPlugin([
            {from:'pacman/Images',to:'Images/pacman'},
			{from:'flappy/Images',to:'Images/flappy'}, 		
			{from:'images',to:'Images'} 					
        ]), 
    new UglifyJsPlugin()
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};