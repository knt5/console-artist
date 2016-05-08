(function() {
	
	// DOM
	var $canvas = $('#canvas');
	var $output = $('#output');
	var $file   = $('#file');
	
	// Canvas
	var context = $canvas.get(0).getContext('2d');
	
	//======================================================
	// EventHandler: on change file
	$file.change(function(event) {
		var file = event.target.files;
		var reader = new FileReader();
		reader.readAsDataURL(file[0]);
		reader.onload = onLoadFile;
	});
	
	//======================================================
	// EventHandler: on load file
	function onLoadFile(event) {
		var reader = event.target;
		var image = new Image();
		image.src = reader.result;
		image.onload = function() {
			// set size
			$canvas.width(image.width);
			$canvas.height(image.height);
			$canvas.prop('width', image.width);
			$canvas.prop('height', image.height);
			
			// clear
			context.clearRect(0, 0, image.width, image.height);
			
			// draw
			context.drawImage(image, 0, 0);
			
			// generate art code
			createArt(image);
		};
	}
	
	//======================================================
	// convert color format
	function hex(r, g, b) {
		return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
	
	//======================================================
	// Generate art code
	function createArt(image) {
		var imageData = context.getImageData(0, 0, image.width, image.height);
		var r, g, b, x, y;
		var colorCode, prevColorCode = '';
		var css = [];
		var colorIndexes = {}, colorIndex = 0;
		var index;
		var colorList = [], cList = [], consoleText = '';
		var art = '';
		
		//-------------------------------------------
		// generate color list
		for(y = 0; y < image.height; y++) {
			for(x = 0; x < image.width; x++) {
				r = imageData.data[x * 4 + y * image.width * 4];
				g = imageData.data[x * 4 + y * image.width * 4 + 1];
				b = imageData.data[x * 4 + y * image.width * 4 + 2];
				colorCode = hex(r, g, b);
				
				if(colorIndexes[colorCode] === undefined) {
					// white to transparent
					if(colorCode === 'ffffff') {
						css.push('');
					} else {
						css.push('background:#' + colorCode + ';');
					}
					colorIndexes[colorCode] = colorIndex;
					colorIndex ++;
				}
			}
		}
		
		//-------------------------------------------
		// code start
		art += '(function(){';
		
		//-------------------------------------------
		// code: color deifinition
		art += 'var ';
		for(colorCode in colorIndexes) {
			index = colorIndexes[colorCode];
			colorList.push('c' + index + "='" + css[index] + "'");
		}
		art += colorList.join(',') + ';';
		
		//-------------------------------------------
		// code: main
		for(y = 0; y < image.height; y++) {
			prevColorCode = '';
			for(x = 0; x < image.width; x++) {
				r = imageData.data[x * 4 + y * image.width * 4];
				g = imageData.data[x * 4 + y * image.width * 4 + 1];
				b = imageData.data[x * 4 + y * image.width * 4 + 2];
				colorCode = hex(r, g, b);
				
				index = colorIndexes[colorCode];
				if(colorCode !== prevColorCode) {
					cList.push('c' + index);
					consoleText += '%c';
					prevColorCode = colorCode;
				}
				consoleText += '　';
			}
			consoleText += '\\n';
		}
		art += "console.log('" + consoleText + "',";
		art += cList.join(',') + ');\n';
		
		//-------------------------------------------
		// message
		art += "return '';";
		
		//-------------------------------------------
		// code end
		art += '})();\n';
		
		//-------------------------------------------
		// output
		$output.text(art);
		
		//-------------------------------------------
		// output to console
		eval(art);
	}
	
	//======================================================
	return {};
})();
