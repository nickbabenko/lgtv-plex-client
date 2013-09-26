function PlexAPI() {
    'use strict';
    
    this.clientIdentifier 	= 'wefq8o7za74on7b9';
    this.apiKey				= 'KQMIY6GATPC63AIMC4R2';
    this.secretKey			= 'k3U6GLkZOoNIoSgjDshPErvqMIFdE0xMTx8kgsrhnC0=';
    
	this.browse = function(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 304) {
                    callback(new MediaContainer(xhr.responseXML.firstChild));
                }
                else {
                    // TODO: Proper error handling
                    console.log('ERROR(' + xhr.status + ') msg: ' + xhr.statusText);
                    callback(new MediaContainer());
                }
            }
        };
        xhr.onerror = function() {
            console.log('ERROR');
            callback(new MediaContainer());
        };
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Plex-Client-Identifier', this.clientIdentifier);
        xhr.send(null);
	};

	this.getURL = function(key, url) {
		if (key != null && key.indexOf('/') === 0) {
			return 'http://'+Settings.getPMS()+':32400' + key;
		}
        else if (!url) {
            return this.sections() + '/' + key;
        }
		else {
			return url + '/' + key;
		}
	}
	
    this.onDeck = function(key) {
        return this.getURL(key) + '/onDeck';
    }
    
    this.recentlyAdded = function(key) {
        return this.getURL(key) + '/recentlyAdded';
    }
     
    this.serverUrl = function() {
	    return 'http://' + Settings.getPMS() + ':32400';
    }
    
	this.sections = function() {
		return this.serverUrl() + '/library/sections';
	}
	
	this.partUrl = function(partId) {
		return this.serverUrl() + '/library/parts/' + partId;
	}
	
	this.saveSubtitle = function(partId, streamId) {
		this.put(this.partUrl(partId) + '?subtitleStreamID=' + streamId);
	}
	
	this.videoUrl = function(video) {			
		var args = {
			path: 'http://127.0.0.1:32400' + video.key,
			mediaIndex: 0,
			partIndex: 0,
			protocol: 'hls',
			offset: 0,
			fastSeek: 0,
			directPlay: 0,
			directStream: 1,
			videoQuality: 100,
			videoResolution: video.width + 'x' + video.height,
			maxVideoBitrate: video.bitrate,
			subtitleSize: 100,
			audioBoost: 100,
			'X-Plex-Client-Identifier': 'c2b8ewbogl',
			'X-Plex-Product': 'Web Client',
			'X-Plex-Device': 'Mac',
			'X-Plex-Platform': 'Chrome',
			'X-Plex-Platform-Version': 7,
			'X-Plex-Version': '1.2.12',
			'X-Plex-Device-Name': 'Plex Web (Chrome)',
			session: 'c2b8ewbogl'
		};
		
		return this.serverUrl() + '/video/:/transcode/universal/start.m3u8?' + this.serialize(args);
	}
	
	this.serialize = function(obj) {
		  var str = [];
		  
		  for(var p in obj)
		     str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
		     
		  return str.join('&');
	}

    /**
     * Ping an address to see if it is an valid Plex Media Server.
     *
     * @param address {string} the ip address of the PMS
     * @param callback {function} function that called with the result. The callback takes
     *                            a boolean param that indicate if the address was valid.
     */
    this.ping = function(address, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 ) {
                    callback(true);
                }
            }
        };
        xhr.onerror = function() {
            callback(false);
        };
        xhr.open('GET', 'http://'+address+':32400/library/sections', true);
        xhr.send(null);
    }
    
    this.get = function(url) {
	    this.request('GET', url);
    }
    
    this.put = function(url) {
	    this.request('PUT', url);
    }
    
    this.request = function(method, url) {
	    var xhr = new XMLHttpRequest();
	   
	    xhr.open(method, url, true);
	    xhr.setRequestHeader('X-Plex-Client-Identifier', this.clientIdentifier);
	    xhr.send(null);
    }

    this.progress = function(key, ratingKey, time, duration, state) {
        this.get(this.serverUrl() + '/:/timeline?time=' + parseInt(time, 10) + '&duration=' + duration + '&state=' + state + '&key=' + encodeURIComponent(key) + '&ratingKey=' + ratingKey);
    };
    
    this.watched = function(key) {
        var url = this.serverUrl() + '/:/scrobble?key='+key+'&identifier=com.plexapp.plugins.library';
        var xhr = new XMLHttpRequest();
        
        xhr.open('GET', url, true);
        xhr.send(null);
    };
    
    this.unwatched = function(key) {
        var url = this.serverUrl() + '/:/unscrobble?key='+key+'&identifier=com.plexapp.plugins.library';
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send(null);
    };

    this.getScaledImageURL = function(url, width, height) {
        return this.serverUrl() + '/photo/:/transcode?width='+width+'&height='+height+'&url=' + encodeURIComponent(url);
    };
}

// Register the API globally
window.plexAPI = new PlexAPI();

