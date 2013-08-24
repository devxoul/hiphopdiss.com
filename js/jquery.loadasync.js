/*
 * jquery.loadasync.js
 *
 *            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *                    Version 2, December 2004
 *
 * Copyright (C) 2013 Su Yeol Jeon
 *
 * Everyone is permitted to copy and distribute verbatim or modified
 * copies of this license document, and changing it is allowed as long
 * as the name is changed.
 *
 *            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 *   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 *
 *  0. You just DO WHAT THE FUCK YOU WANT TO.
 *
 */

(function($) {
	var queue = [];
	
	$.fn.loadasync = function() {
		queue.length = 0;
		this.each(function() {
			queue.push(this);
		});

		if(queue.length) {
			_loadImage(queue.shift());
		}

		return this;
	};

	function _loadImage(img) {
		var image = $(img);
		var url = image.attr('async-src');
		$.ajax({
			url: url,
			cache: true,
			processData: false,
			contentType: 'image/jpeg',
			success: function(data) {
				image.attr('src', url);
				if(queue.length) {
					_loadImage(queue.shift());
				}
			}
		});
	}
})(jQuery);