(function() {
	
	// DOM
	var $canvas  = $('#canvas');
	var $output  = $('#output');
	var $file    = $('#file');
	var $message = $('#message')
	
	// Canvas context
	var context = $canvas.get(0).getContext('2d');
	
	// Constant
	var maxImageSize = 20000;
	var reducedImageWidth = 120;
	var reducedImageRatio = 3 / 16;
	
	//=================================================================
	// On change file
	$file.change(function(event) {
		// Delete message
		$message.text('');
		
		// Get files
		var files = event.target.files;
		if(files.length > 0) {
			// Start to read file
			var reader = new FileReader();
			reader.readAsDataURL(files[0]);
			
			// Register FileReader onload handler
			reader.onload = onLoadFile;
		}
	});
	
	//=================================================================
	// On load file
	function onLoadFile(event) {
		// Get file reader
		var reader = event.target;
		
		// Create image
		var image = new Image();
		
		// Set image source
		image.src = reader.result;
		
		// Register Image onload handler
		image.onload = function() {
			var width = 0;
			var height = 0;
			
			// Check image size
			var size = image.width * image.height;
			var isLargeImage = false;
			if(size > maxImageSize) {
				isLargeImage = true;
			}
			if(isLargeImage) {
				// Alert
				$message.text('Image is too large, reduced size and changed aspect ratio.');
				
				// Calculate reduced image size
				width = reducedImageWidth;
				height = reducedImageWidth / image.width * reducedImageRatio * image.height;
				
			} else {
				width = image.width;
				height = image.height;
			}
			
			// Set canvas size
			$canvas.width(width);
			$canvas.height(height);
			$canvas.prop('width', width);
			$canvas.prop('height', height);
			
			// Clear canvas
			context.clearRect(0, 0, width, height);
			
			// Draw image
			if(isLargeImage) {
				context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
			} else {
				context.drawImage(image, 0, 0);
			}
			
			// Generate art code
			createArt(context.getImageData(0, 0, width, height));
		};
	}
	
	//=================================================================
	// Convert color format
	function hex(r, g, b) {
		return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
	}
	
	//=================================================================
	// Generate art code
	function createArt(imageData) {
		var width = imageData.width;
		var height = imageData.height;
		var r, g, b, x, y;
		var colorCode, prevColorCode = '';
		var css = [];
		var colorIndexes = {}, colorIndex = 0;
		var index;
		var colorList = [], cList = [], consoleText = '';
		var art = '';
		
		//-------------------------------------------
		// Generate color list
		for(y = 0; y < height; y++) {
			for(x = 0; x < width; x++) {
				r = imageData.data[x * 4 + y * width * 4];
				g = imageData.data[x * 4 + y * width * 4 + 1];
				b = imageData.data[x * 4 + y * width * 4 + 2];
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
		// Generate code
		
		// Begin
		art += '(function(){';
		
		// Color deifinition
		art += 'var ';
		for(colorCode in colorIndexes) {
			index = colorIndexes[colorCode];
			colorList.push('c' + index + "='" + css[index] + "'");
		}
		art += colorList.join(',') + ';';
		
		// Console text
		for(y = 0; y < height; y++) {
			prevColorCode = '';
			for(x = 0; x < width; x++) {
				r = imageData.data[x * 4 + y * width * 4];
				g = imageData.data[x * 4 + y * width * 4 + 1];
				b = imageData.data[x * 4 + y * width * 4 + 2];
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
		
		// Message
		art += "return '';";
		
		// End
		art += '})();\n';
		
		//-------------------------------------------
		// Output
		$output.text(art);
		
		// Output to console
		eval(art);
	}
	
	//=================================================================
	return {};
})();
