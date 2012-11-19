/**
 * Parallax Scrolling
 * November 2012
 *   
 * Author: Arthur Julian
 * 		   https://github.com/artjulian/
 * 		   @artjulian
 *
 * Credits: 
 *			- Richard Shepherd for setting up the basis (@richardshepherd)
 *			- Jannis Nikou with helping writing the code and working out the kinks
 */

// On your marks, get set...
$(document).ready(function(){
	// Cache the Window object
	$window = $(window);
	
	// Cache the Y offset and the speed of each sprite
	$('[data-type]').each(function() {	
		$(this).data('offsetY', parseInt($(this).attr('data-offsetY')));
		$(this).data('Xposition', $(this).attr('data-Xposition'));
		$(this).data('xPos', $(this).attr('data-xPos'));
		$(this).data('yPos', $(this).attr('data-yPos'));
		$(this).data('speed', $(this).attr('data-speed'));
		$(this).data('start', $(this).attr('data-start'));
		$(this).data('end', $(this).attr('data-end'));
		$(this).data('endState', $(this).attr('data-endState'));
	});

	/* Optimising the mobile phone screen size. This needs work */
	var pageHeight = (window.orientation == 180 || window.orientation == 0) ? 928 : 671;
	if(isMobile) pageHeight = 415;
	
	var supportsOrientationChange = "onorientationchange" in window,
	    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";
	
	if( window.addEventListener ){
		window.addEventListener(orientationEvent, function() {
			pageHeight = (window.orientation == 180 || window.orientation == 0) ? 928 : 671 
			if(isMobile) pageHeight = 415;
		}, false);
	}else{
		window.attachEvent(orientationEvent, function() {
			pageHeight = (window.orientation == 180 || window.orientation == 0) ? 928 : 671 
			if(isMobile) pageHeight = 415;
		}, false);
	}
	
	//scroll timer shows when the user goes idle for a bit
	var scrollTimer = null;
	$scroll = $('.scroll');
	
	// For each element that has a data-type attribute
	$('section').each(function(){
		// Store some variables based on where we are
		var $self = $(this),
			offsetCoords = $self.offset(),
			topOffset = offsetCoords.top;
		
		//cloning the article in order to create a proper fixed element to scroll
		var $clone = document.createElement('article');
		$($clone).addClass('clone');
		
		// When the window is scrolled...
	    $window.scroll( function() {
			$top = $window.scrollTop();
			
			// If this section is in view
			if ( ($top + $window.height()) > (topOffset) &&
				 ( (topOffset + $self.height()) > $top ) ) {
				
				//reset navigation arrow
				setNav($self);
				
				//make sure you're not on a mobile device
				if(!isIpad && !isMobile){
				
					//show section
					$self.show();
				
					// Scroll the background at var speed
					// the yPos is a negative value because we're scrolling it UP!								
					var yPos = -($top / $self.data('speed')); 
					
					//fadeOut scroll instruction
					$scroll.hide();
					if( scrollTimer != null ){
						clearTimeout(scrollTimer);
					}
					
					scrollTimer = setTimeout( function(){ $scroll.fadeIn('fast'); }, 2500 );
					
					// If this element has a Y offset then add it on
					if ($self.data('offsetY')) {
						yPos += $self.data('offsetY');
					}
					
					// Put together our final background position
					var coords = '50% '+ yPos + 'px';
					
					// Move the background
					$self.css({ backgroundPosition: coords });
					
					// Check for vertical sprites in this section	
					$('[data-type="sprite-vertical"]', $self).each(function() {
						
						// Cache the sprite
						var $spriteV = $(this);
						
						// Use the same calculation to work out how far to scroll the sprite
						var start = parseInt($spriteV.data('start'));
						var speed = parseFloat($spriteV.data('speed'));
						var end = ($spriteV.data('end') == '') ? '' : parseInt($spriteV.data('end'));
						var xPos = $spriteV.data('xPos');
						
						//calculate position within current section
						var curPos = $top - topOffset;
						var newPos = start + (curPos*speed);
						
						if( end != '' ){
							if( speed <= 0 ){
								if( newPos+(curPos-($spriteV.offset().top-topOffset)) <= end ){
									newPos = end;
									$spriteV.css('background-attachment','scroll');
								}else{
									$spriteV.css('background-attachment','fixed');
								}
							}else{
								if( newPos+(curPos+(topOffset-$spriteV.offset().top)) >= end ){
									newPos = end;
									$spriteV.css('background-attachment','scroll');
								}else{
									$spriteV.css('background-attachment','fixed');
								}
							}
						}else{
							$spriteV.css('background-attachment','fixed');
						}
						
						var coords = xPos + ' ' + newPos + 'px';
						$spriteV.css({ backgroundPosition: coords });											
						
					}); // sprites
					
					// Check for horizontal sprites in this section	[REWRITE]
					$('[data-type="sprite-horizontal"]', $self).each(function() {
						
						// Cache the sprite
						var $spriteH = $(this);
						//calculate position within current section
						var curPos = $top - topOffset;
						
						var start = parseInt($spriteH.data('start'));
						var speed = parseFloat($spriteH.data('speed'));
						var end = ($spriteH.data('end') == '') ? '' : parseInt($spriteH.data('end'));
						var yPos = parseInt($spriteH.data('yPos'));
						var endState = $spriteH.data('endState');

						var newPos = start + (curPos*speed);
						
						if( end != '' ){
							if( speed < 0 ){
								if( newPos <= end ){
									newPos = end;
								}
							}else{
								if( newPos >= end ){
									newPos = end;
								}
							}
						}
						
						var attach = ( endState == 'fixed') ? 'fixed' : 'scroll';
						
						var coords = newPos + '% ' + yPos + 'px';
						$spriteH.css({ backgroundPosition: coords, backgroundAttachment : attach });
					});
			
					// Check for any Videos that need scrolling
					$('[data-type="video"]', $self).each(function() {
						
						// Cache the video
						var $video = $(this);
						
						// There's some repetition going on here, so 
						// feel free to tidy this section up. 
						var yPos = -($top / $video.data('speed'));					
						var coords = (yPos + $video.data('offsetY')) + 'px';
		
						$video.css({ top: coords });											
					}); // video
						
					//Check for blocks that need to fix to a position in pixels
					$('[data-type="vertical-block"]', $self).each(function(){
						//Cache the block
						var $block = $(this);
						
						//set var to determine scroll behavior
						var start = parseInt($block.attr('data-start'));
						var end = parseInt($block.attr('data-end'));
						var speed = parseFloat($block.attr('data-speed'));
						
						//calculate position within current section
						var curPos = $top - $self.offset().top;
	
						//calculate new position
						var newPos = (speed != 0) ? start + (curPos*speed) : start + curPos ;
						if( end != '' ){
							newPos = ( newPos >= end ) ? end : newPos;	
						}
						if(curPos >= 0 && end > 0){
							if($block.css('visibility') == 'hidden'){
								
							}else if($block.css('position') != 'fixed'){
								$clone = $(this).clone();
								$clone.attr('data-type', '');
								$block.css('visibility', 'hidden');
																
								if(($block.offset().top+newPos) > 0) {
									$clone.css('top',  "0px");
 									$clone.css('padding-top',  $(this).css('padding-top'));
								}
									
								$clone.css('position', 'fixed').addClass('clone');
								$self.append($clone);
								$('.clone').each( function(){
									if( $(this).get(0) != $($clone).get(0) ){
										$(this).remove();
									}
								});
								if(curPos >= end){
									$block.css('visibility', 'hidden');
								}
							}
						}
							
						if(curPos >= end || curPos < 0){
							if($clone.length > 0) $clone.remove();
							$block.css('visibility', 'visible');
						}
						
						newPos = (newPos<=start) ? start : newPos;
						$block.css({top: newPos+'px'});
					});	
					
					$('[data-type="horizontal-block"]', $self).each(function(){
						var $block = $(this);
						
						var start = parseInt($block.attr('data-start'));
						var end = parseInt($block.attr('data-end'));
						var speed = parseFloat($block.attr('data-speed'));
						var yPos = parseInt($block.attr('data-yPos'));
						
						var curXPos = $top - $self.offset().top;
						var newXPos = start + (curXPos*speed);
						
						var posVal = 'fixed';
						var newYPos = null;
						
						if( end != '' ){
							if( speed < 0 ){
								if( newXPos <= end ){
									newXPos = end;
									posVal = 'absolute';
									//newYPos = offset.top+'px';
								}
							}else{
								if( newXPos >= end ){
									newXPos = end;
									posVal = 'absolute';
									newYPos = $self.offset().top+'px';
								}
							}	
						}

						$block.css({top:yPos});
						$block.css({position:posVal}); 
						$block.css({left: newXPos+'px'});
					});					
				}
			
				// if(isIpad){
// 					var val = (pageHeight == 928) ? 928 : 672;
// 					var totalPages = Math.ceil($self.height()/val);
// 					var stopAt = 1;
// 					
// 					if(parseInt($self.attr('data-stopAt')) > 0){
// 						stopAt = parseInt($self.attr('data-stopAt'));
// 					}
// 							
// 					$first = $('[data-type="block"]', $self).first();
// 				
// 					if(($top-topOffset) <= 0){
// 						$first.css('position', 'absolute');
// 					}else if(($top-topOffset)-5 > ((totalPages-stopAt) * val)){
// 					$first.css('position', 'absolute');
// 									
// 					}else if(($top-topOffset) > 0){
// 						$first.css('position', 'fixed');
// 					}
// 				}
				
				if((isMobile /*|| isIpad*/) && (topOffset - ($top-$self.height())) > 412){
					$first = $('[data-type="block"]', $self).first();
					$first.css('position', 'fixed');
					
					if(($self.offset().top+2) == $top){
						$first.css('position', 'absolute');
					}else if($self.offset().top > $top){
						$first.css('position', 'fixed');
					}
				}else if((isMobile /*|| isIpad*/)){
					$first = $('[data-type="block"]', $self).first();
					$first.css('position', 'absolute');
				}
			}else{
				if((isMobile /*|| isIpad*/)){
					$first = $('[data-type="block"]', $self).first();
					$first.css('position', 'absolute');
				}
				
				// Not in view, remove.
				//$($clone).remove();
				$(this).css('visibility', 'visible');
				$(this).removeClass('expanded');
			}; // in view
		}); // window scroll
		
		if(isMobile){
			$('article.case-text', $self).each(function(){
				$(this).bind('touchend', function(){
				
					$(this).toggleClass('expanded');

					if($(this).hasClass('expanded')){
						//$('.site-title').hide();
						//$('header nav').hide();
						$('.site-title').fadeOut(300);
						$('header nav').fadeOut(300);
					}else{
						//$('.site-title').show();
						//$('header nav').show();
						$('.site-title').fadeIn(300);
						$('header nav').fadeIn(300);
					}
				});
			});
		}
	});	// each data-type
	
	$sectionHeights = $('section').map( function(){
							var height = $(this).outerHeight();
							var section = $(this).attr('id');
							return { height : height };
						}).get();
	//cache the navigation bar
	$nav = $('nav.sub ul');
	$liHeights = $nav.find('li').map( function(){
	 						var height = $(this).height();
	 						return { height : height };
	 					}).get();
	$sectionIndexStart = $($('section').get(0)).index();
	
	//adjust position of arrow in navigation bar when scrolling
	function setNav( section ){
		var index = section.index()-$sectionIndexStart;
		var sectionHeight = $sectionHeights[index].height;
		var liHeight = $liHeights[index].height;
		var nav = $('nav.sub ul');
		
		//current pos in %
		var pos = ($top - section.offset().top)/(sectionHeight/100);
		
		//top of related list
		var topLi = nav.find('li a[href="#'+section.attr('id')+'"]').parent().position().top - nav.position().top;
		var adjLi = (liHeight/100)*pos;
		
		if( adjLi >= 0){
			var coords = 'left ' + (topLi+adjLi-2) + 'px';
	 		$nav.css({ backgroundPosition: coords });
	 		var curLi = $nav.find('li a[href="#'+section.attr('id')+'"]');
	 		if( !curLi.hasClass('active') ){
	 			$nav.find('.active').removeClass('active');
	 			curLi.addClass('active');
	 		}
	 	}
	}// scroll navigation
	
	//reset articles when clicking on left navigation
	$('a[href^=#]').on('click', function(){
	 	if(window.location.hash) {
	 		resetArticles();
	 	}
	 });
	 	
	 function resetArticles(){
	 	$('article').attr('style','');
	 }
	    
	 //adding CSS-animations to elements using bullseye
	 $('.jsSetAnimation')
	 	.bind('enterviewport', animateIn)
	 	.bind('leaveviewport', animateOut)
	 	.bullseye();
	 
	 function animateIn( e ){
	 	$(this).addClass('animate');
	 }
	 
	 function animateOut( e ){
	 	$(this).removeClass('animate');
	 }
}); // document ready