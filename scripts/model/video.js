/**
 * Parses a video container from Plex and returns if a simple/flat video
 * model.
 *
 * @author Jakob Hilarius
 *
 * @constructor
 * @param {object} elem The video element returned from Plex. This is NOT including the media container.
 */
function Video(elem) {
    /**
     * Convert the video container returned by Plex to a mime type for the player.
     *
     * @param {String} container the video container
     * @returns {String} the mime type
     */
    function getContainerMimeType(container) {
        if (container === null)
            return null;

        if (container === 'mp4')
            return 'video/mp4';
     
        if (container === 'mkv')
        	return 'application/x-netcast-av';
            //return 'video/x-matroska';
        
        if (container === 'mpeg')
            return 'video/mpeg';
        
        if (container === 'avi') 
            return 'video/avi';
        
        // try to show
        return 'application/x-netcast-av';
    }

    /**
     * Returns the media information such as codec, bitrate, resolution etc.
     *
     * @param {object} stream the library stream that contains the information.
     * @returns {object} an object containing the available media information.
     */
    function getVideoStreamInformation(stream) {
        return {
            codec: stream.getAttribute('codec'),
            bitrate: stream.getAttribute('bitrate'),
            framerate: stream.getAttribute('frameRate'),
            profile: stream.getAttribute('profile'),
            level: stream.getAttribute('level')
        };
    }

    /**
     * Returns the media information such as codec, bitrate, resolution etc.
     *
     * @param {object} stream the library stream that contains the information.
     * @returns {object} an object containing the available media information.
     */
    function getAudioStreamInformation(stream) {
        return {
            codec: stream.getAttribute('codec'),
            bitrate: stream.getAttribute('bitrate')
        };
    }
    
	var key = elem.getAttribute('key');
    var ratingKey = elem.getAttribute('ratingKey');
	var title = elem.getAttribute('title');
	var type = elem.getAttribute('type');
	var summary = elem.getAttribute('summary');
	var year = elem.getAttribute('year');
	var originallyAvailableAt = elem.getAttribute('originallyAvailableAt');

    var season = elem.getAttribute('parentIndex');
    var episode = elem.getAttribute('index');

	var thumb = elem.getAttribute('thumb');
    var art = elem.getAttribute('art');

    var duration = 0;
    
    if (elem.getAttribute('duration') !== null)
        duration = Math.floor(parseInt(elem.getAttribute('duration'), 10) / 1000);

    var viewOffset = 0;
    
    if (elem.getAttribute('viewOffset') !== null)
        viewOffset = Math.floor(parseInt(elem.getAttribute('viewOffset'), 10) / 1000);

    var viewCount = elem.getAttribute('viewCount');

    var grandparentTitle = elem.getAttribute('grandparentTitle');
    var grandparentThumb = elem.getAttribute('grandparentThumb');

	var partId;
    var resolution;
    var width;
    var height;
    var bitrate;

	var url = '';
    var mimeType = null;
    var mediaId;
    
	var subtitles = [],
		selectedSubtitle = -1,
		defaultSubtitle	= -1;
		
	var files = [];

    var streamInformation = {};

    var children = elem.childNodes;
    var mediaCount = children.length;
    
	for (var i = 0; i < mediaCount; i++) {
		var media = children[i]
		
		if (media.nodeName !== 'Media')
            continue;

		mediaId = parseInt(media.getAttribute('id'));
		bitrate = media.getAttribute('bitrate');
        mimeType = media.getAttribute('container');
        resolution = media.getAttribute('videoResolution');
        width = parseInt(media.getAttribute('width'));
        height = parseInt(media.getAttribute('height'));

		var parts = media.getElementsByTagName('Part');
        var partCount = parts.length;
        
		for (var j = 0; j < partCount; j++) {
			var part = parts[j];

			partId			= part.getAttribute('id');
			
			var partKeyAttrNode = part.attributes.getNamedItem('key');
			
			if (partKeyAttrNode !== null) {
				url = partKeyAttrNode.nodeValue;
				
				files.push(url);
			}

			var streams = part.getElementsByTagName('Stream');
            var streamCount = streams.length;
                        
			for (var k = 0; k < streamCount; k++) {
				var stream = streams[k];
                var streamType = stream.getAttribute('streamType');

				if(streamType === '3') {				
					if(stream.getAttribute('selected') == '1')
	                	selectedSubtitle = subtitles.length; // The index of the subtitle we are now adding
	                	
	                if(stream.getAttribute('default') == '1')
	                	defaultSubtitle = subtitles.length; // The default subtitle - if none are selected, this is used
				
	                subtitles.push({
		               id: stream.getAttribute('id'),
		               index: stream.getAttribute('index'),
		               language: stream.getAttribute('language'),
		               languageCode: stream.getAttribute('languageCode'),
		               format: stream.getAttribute('format')
	                });
                }
			}
		}
	}

	return {
		mediaId: mediaId,
		partId: partId,
		key: key,
        ratingKey: ratingKey,
		type: type,
		container: false,
		title: title,
        season: season,
        episode: episode,
		summary: summary,
        year: year,
        originallyAvailableAt: originallyAvailableAt,
		thumb: thumb,
        grandparentTitle: grandparentTitle,
        grandparentThumb: grandparentThumb,
		art: art,
		url: url,
        mimeType: getContainerMimeType(mimeType),
        containerMimeType: mimeType,
		subtitles: subtitles,
		selectedSubtitle: selectedSubtitle,
		defaultSubtitle: defaultSubtitle,
        duration: duration,
        viewCount: viewCount,
        viewOffset: viewOffset,
        stream: streamInformation,
        width: width,
        height: height,
        bitrate: bitrate
	};
}