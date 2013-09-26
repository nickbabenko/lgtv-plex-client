/**
 * The player view.
 * <p>
 * The view also handles reporting progress information to Plex as well as marking the
 * video as watched when a given amount has been viewed.
 * </p>
 *
 * @author Jakob Hilarius, http://syscall.dk
 *
 * @constructor
 * @param {string} uri The PLex API address of the video meta data.
 * @param {boolean} [useViewOffset] If <code>true</code> the view offset will be used.
 * @param {object} [returnView] The view to return to
 */
/*global Popcorn,video */
function PlayerView(uri, useViewOffset, returnView) {

	// !CONSTANTS
	
    var CONTROLS_TIMEOUT = 5000;
    var PROGRESS_INTERVAL = 60000;

    // The percentage of the files that has to be view before we regard it as watched
    var WATCHED_PERCENTAGE = 90;

    var scope = this;


	// !VIEW ELEMENTS
	
    var player = document.getElementById('player');
    var controls = document.getElementById('controls');
    var status = document.getElementById('player-status-message');

	
	// !CONFIGURE VIEW

    if (Settings.useAnim())
        platform.addTransition(controls, '500ms', 'bottom');


	// !VIDEO CONFIGURATION

    var totalDuration = 0;
    var durationIndex = 0;

    var currentMedia;
    var loading = false;
    var startViewOffset = null;

    var controlsTimer;
    var processTimer;
    var plexProgressTimer;
    
    var lastPlexUpdateTime;
    
    var video;
    var state = 'stopped';
    
    var video;
    
    var subtitlesEnabled = false,
    	currentSubtitle = -1;

    function showControls(msg, timeout) {
        controls.style.bottom = 0;
        status.innerHTML = msg;

        if (timeout) {
            clearTimeout(controlsTimer);
            controlsTimer = setTimeout(hideControls, timeout);
        }
    }
    function hideControls() {
        controls.style.bottom = -controls.offsetHeight + 'px';
    }

    function showPlayer () {
        player.style.display = 'block';
        // Initially the player is offscreen due to the loading hack, so we need to move it back
        player.style.top = '0';
    }
    
    function closePlayer(e) {
        hideControls();
                
        //video.pause();

        // Manually report that we have stopped
        reportPlexProgress(e);

        clearInterval(plexProgressTimer);
        clearInterval(controlsTimer);

        if (!returnView) {
            window.view = new HomeView();
        }
        else {
            window.view = returnView;
        }
        
        window.view.reload();

        player.style.display = 'none';
    }

    function reportPlexProgress(e) {    
        if (!currentMedia)
            return;
                        
        var duration = e.jPlayer.status.duration;
        var position = e.jPlayer.status.currentTime;
        
        if(lastPlexUpdateTime != null &&
           ((position - lastPlexUpdateTime) < 10)) { // only every 10 seconds
	    	 return;
        }
                  

        if (duration === 0) {
            // This happens when we are stopping a video
            return;
        }
        
        lastPlexUpdateTime = position;

        var viewedPercentage = Math.floor((position / duration) * 100);

        if (viewedPercentage > WATCHED_PERCENTAGE) {
            console.log('Reporting watched since we have viewed ' + viewedPercentage + '%');

            // Last 5 min. are regarded as watched
            plexAPI.watched(currentMedia.ratingKey);

            // Stop any further progress reporting
            clearInterval(plexProgressTimer);

            return;
        }

        plexAPI.progress(currentMedia.key, currentMedia.ratingKey, (position * 1000), (currentMedia.duration * 1000), state);
    }

    function setMetaData(media) {
        var heading1, heading2;
        var title = document.getElementById('controls-title');

        if (media.type === 'episode') {
            heading1 = media.grandparentTitle.encodeHTML();
            heading2 = 'Season ' + media.season + ', Episode ' + media.episode + '<br/>' + media.title.encodeHTML();
        }
        else {
            heading1 = media.title.encodeHTML();
            heading2 = '(' + media.year + ')';
        }

        title.innerHTML = '<h1>' + heading1 + '</h1><h2>' + heading2 + '</h2>';

        document.getElementById('controls-description').innerHTML = media.summary.encodeHTML();
    }

    function readyHandler(e) {
        loading = false;
        
        document.getElementById('video-loading').style.display = 'none';

        setDuration(e);
    }

    function setDuration(e) {
        document.getElementById('total-duration').innerHTML = Time.format(e.jPlayer.status.duration);
    }

    /**
     * Update the progress bar.
     */
    function updateElapsedTime(e) {    	
    	var duration = e.jPlayer.status.duration;
    	var currentTime = e.jPlayer.status.currentTime;
    
    	var progressBarBase = document.getElementById('progressbar-back');
    	    	    
        document.getElementById('duration').innerHTML = Time.format(currentTime);
        document.getElementById('progressbar-front').style.width = ((progressBarBase.offsetWidth / 100) * ((currentTime / duration) * 100)) + 'px';
    }

    /**
     * Toggle the player state between playing and paused.
     */
    function togglePause() {
        if (loading)
            return;

        if (state == 'paused') {
            $('#video').jPlayer('play');
            
            // Delay hidding the controls a bit to make it more fluent
            setTimeout(function() {
                hideControls();
            }, 1000);
        }
        else {
            $('#video').jPlayer('pause');
            
            showControls('PAUSED');
        }
    }

    /**
     * Takes the video to a specific point
     *
     * @param {number} time the time to skip in seconds
     */
    function doSkip(time) {
        if (loading)
            return;
            
        showControls(' ', CONTROLS_TIMEOUT);
        
        $('#video').jPlayer('play', time);        
    }
    
    function toggleSubtitles() {
    	loading = true;-
    
    	console.log('toggleSubtitles');
    
	    if(!subtitlesEnabled) {
	    	console.log('enable subtitles');
	    	if(currentSubtitle == -1)
	    		currentSubtitle = currentMedia.defaultSubtitle;	
	    		
			plexAPI.saveSubtitle(currentMedia.partId, currentMedia.subtitles[currentSubtitle].id);
	    
	    	var currentSubtitleObject = currentMedia.subtitles[currentSubtitle];
                        
            subtitlesEnabled = true;
            
            showInfo('Subtitles<br />' + currentSubtitleObject.language);
	    }
	    else {  
	    	plexAPI.saveSubtitle(currentMedia.partId, '');
	    
		    subtitlesEnabled = false;
		    
		    showInfo('Subtitles<br />Disabled');
	    }
	    
	    var url = plexAPI.videoUrl(currentMedia);
        var urls = { 'm3u8': url };
        
        state = 'paused';
	    
	    $('#video').jPlayer('pause');
	    $('#video').jPlayer('clearMedia');
	    $('#video').jPlayer('setMedia', urls);	    
    }
    
    
    /* !Key Events */

	this.onUp = function () {
        hideControls();
	}
	
	this.onDown = function () {
        showControls('');
	}
	
	this.onLeft = function () {
       // doSkip((video.currentTime - 60.0));
       toggleSubtitles();
	}
	
    this.onRew = function () {
        doSkip((video.currentTime - 300.0));
    }
    
	this.onRight = function () {
        doSkip((video.currentTime + 60.0));
	}
	
    this.onFF = function () {
        doSkip((video.currentTime + 300.0));
    }
    
	this.onEnter = function () {
        togglePause();
	}
	
    this.onPlay = function () {
        togglePause();
    }
    
    this.onPause = function () {
        togglePause();
    }
    
	this.onBack = function () {
        closePlayer();
	}
	
    this.onStop = function () {
        closePlayer();
    }
    
    this.onRed = function () {
	    toggleSubtitles();
    }
    
    /* !View */
    
	this.render = function (container) {
		currentMedia = container.media[0];

        showPlayer();
                
        if (useViewOffset && currentMedia.viewOffset) {
            // Save the offset so we can set if when the video is loaded
            startViewOffset = currentMedia.viewOffset;
        }
        else
	        startViewOffset = 0;
	                        
        // If this media has subtitles enabled already
        if(currentMedia.selectedSubtitle > -1) {
        	// Keep a reference of the index
        	currentSubtitle = currentMedia.selectedSubtitle;
        	
        	subtitlesEnabled = true;
        }
        
        setMetaData(currentMedia);
        
        //var scaleRatio   	= (currentMedia.width / currentMedia.height);
        var videoWidth 		= window.outerWidth; // fixed width depending on the viewport 
        var videoHeight		= Math.min(window.outerHeight, currentMedia.height); //(videoWidth / scaleRatio);    

        var url = plexAPI.videoUrl(currentMedia);
        var urls = { 'm3u8': url };
	      	    
	    $('#video').jPlayer({
		   solution: 'html',
		   supplied: 'm3u8',
		   size: {
			   width: videoWidth,
			   height: videoHeight
		   },
		   ready: function() {		   
			   $(this).jPlayer('setMedia', urls);  
			   $(this).jPlayer('play', startViewOffset);  
			},
			loadeddata: function(e) {
				 if(loading) {
	    			loading = false;
	    		
	    			readyHandler(e);
				}
				
				$(this).jPlayer('play', startViewOffset); 
			},
			ended: function() {
				state = 'stopped';
    	
				reportPlexProgress();
				closePlayer();
			},
			timeupdate: function(event) {
				reportPlexProgress(event);
			},
			stalled: function() {
				showControls('BUFFERING', CONTROLS_TIMEOUT);
			},
			error: function(e) {			
				state = 'stopped';
    	
				closePlayer(e);
			},
			progress: function() {
				showControls('BUFFERING', CONTROLS_TIMEOUT);
			},
			timeupdate: function(e) {
				if(loading && state != 'playing')
					return;
			
				reportPlexProgress(e);	    	
				updateElapsedTime(e);
								
				video = e.jPlayer.status;
								
				startViewOffset = e.jPlayer.status.currentTime;
			},
			play: function() {
				state = 'playing';
			},
			pause: function() {
				state = 'paused';
			}
	    });
                           
        $('#video, #video .video').css({ height: videoHeight, width: videoWidth, marginTop: -(videoHeight / 2) }); 
	};
	
	
	/* Initialize */
	
    loading = true;
    
    document.getElementById('video-loading').style.display = 'block';

	plexAPI.browse(uri, function(container) {
		scope.render(container);
	});
}