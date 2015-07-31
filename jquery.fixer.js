/*!
 * jquery.fixer.js 1.0.0 - https://github.com/yckart/jquery.fixer.js
 * Fix elements as `position:sticky` do.
 *
 *
 * Copyright (c) 2013 Yannick Albert (http://yckart.com/) | @yckart
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 * 2013/07/02
 *
 * Contributors
 *     - Jefferson Rafael Kozerski (https://github.com/jeffdrumgod) | @jeff_drumgod
 **/

;(function($, window) {

	var $win = $(window),
		eventIsTrigged = false,
		$elementsQueue = $(),
		defaults = {
			gap: 0,
			horizontal: false,
			isFixed: $.noop
		};

	function supportSticky(elem) {
		var prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'], prefix;
		while (prefix = prefixes.pop()) {
			elem.style.cssText = 'position:' + prefix + 'sticky';
			if (elem.style.position !== '') return true;
		}
		return false;
	}

	function processElements(eventScroll){
		if($elementsQueue.length){
			for (var i = $elementsQueue.length - 1; i >= 0; i--) {
				processFixerElement.call(
					$elementsQueue[i]
				);
			};
		}
	}

	function processFixerElement(){
		var style = this.style,
			$this = $(this),
			options = $this.data('fixer'),
			$parent, scrollPos, elemSize, parentPos, parentSize;

		if(!options.pause){
			if (supportSticky(this)) {
				style[cssPos] = options.gap + 'px';
				return;
			}
			$parent = $this.parent();
			scrollPos = $win[!!options.horizontal ? 'scrollLeft' : 'scrollTop']();
			elemSize = $this[!!options.horizontal ? 'outerWidth' : 'outerHeight']();
			parentPos = $parent.offset()[options.cssPos];
			parentSize = $parent[!!options.horizontal ? 'outerWidth' : 'outerHeight']();

			if (scrollPos >= parentPos - options.gap && (parentSize + parentPos - options.gap) >= (scrollPos + elemSize)) {
				style.position = 'fixed';
				style[options.cssPos] = options.gap + 'px';
				options.isFixed();
			} else if (scrollPos < parentPos) {
				style.position = 'absolute';
				style[options.cssPos] = 0;
			} else {
				style.position = 'absolute';
				style[options.cssPos] = parentSize - elemSize + 'px';
			}
		}
	}

	function removeFromQueue(){
		var $this = $(this),
			indexQueue = $this.index($elementsQueue),
			options = $this.data('fixer');
		if(indexQueue > -1){
			$this.removeData('fixer');
			$elementsQueue.splice(indexQueue,1);

			if(!!options.originalStyle){
				$this.attr('style', options.originalStyle);
			}else{
				$this.removeAttr('style');
			}
		}
	}

	$.fn.fixerDestroy = function() {
		this.each(function(i,e) {
			removeFromQueue.call(e);
		});
	};

	$.fn.fixer = function(newOptions) {
		var winEventsScroll = (($._data(window,'events') || {}).scroll || []),
			options = {};

		options = $.extend({}, defaults, (jQuery.isPlainObject(newOptions) ? newOptions : {}));
		options.cssPos = (!!options.horizontal ? 'left' : 'top');

		this.each(function(i,e) {
			var $this = $(e),
				indexQueue = $this.index($elementsQueue),
				data = ($this.data('fixer') || {});

			if('string' === typeof newOptions){
				if(indexQueue > -1){
					switch(newOptions){
					case 'pause':
						data.pause = true;
						$this.data('fixer', data);
						break;
					case 'resume':
						data.pause = false;
						$this.data('fixer', data);
						break;
					case 'destroy':
						removeFromQueue.call(e);
						break;
					}
				}
			}else{
				if(indexQueue > -1){
					$elementsQueue.splice(indexQueue,1);
				}
				$this.data('fixer', options);
				$elementsQueue = $elementsQueue.add($this);
			}
		});

		if(!eventIsTrigged){
			if(!!winEventsScroll.length){
				for (var i = winEventsScroll.length - 1; i >= 0; i--) {
					if(winEventsScroll[i].namespace === 'fixer'){
						eventIsTrigged = true;
					}
				};
			}
			if(!eventIsTrigged){
				eventIsTrigged = true;
				$win.on('scroll.fixer', function(event) {
					processElements(event);
				}).resize();
			}
		}
	};
}(jQuery, this));
