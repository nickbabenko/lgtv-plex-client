function Track(elem) {

	var ratingKey 				= elem.getAttribute('ratingKey');
	var key 					= elem.getAttribute('key');

	var type 					= elem.getAttribute('type');
	var title					= elem.getAttribute('title');
	var summary					= elem.getAttribute('summary');
	var thumb					= elem.getAttribute('thumb');
	var duration				= elem.getAttribute('duration');
	var addedAt					= elem.getAttribute('addedAt');
	var updatedAt				= elem.getAttribute('updatedAt');

	var parentTitle				= elem.getAttribute('parentTitle');
	var parentRatingKey 		= elem.getAttribute('parentRatingKey');
	var parentIndex				= elem.getAttribute('parentIndex');
	var parentYear				= elem.getAttribute('parentYear');
	var parentKey				= elem.getAttribute('parentKey');
	var parentThumb				= elem.getAttribute('parentThumb');
	
	var grandparentTitle		= elem.getAttribute('grandparentTitle');
	
	var media					= [];
		
	for(var i=0; i<elem.childNodes.length; i++) {
		var _media 				= elem.childNodes[i],
			parts				= [];
						
		if(typeof _media.nodeName == 'undefined' || _media.nodeName != 'Media')
			continue;
				
		for(var j=0; j<_media.childNodes.length; i++) {
			var part = _media.childNodes[i];
						
			if(typeof part == 'undefined' ||
			   typeof part.nodeName == 'undefined' || 
			   part.nodeName != 'Part')
				continue;
			
			parts.push({
				id					: part.getAttribute('id'),
				key					: part.getAttribute('key'),
				duration			: part.getAttribute('duration'),
				file				: part.getAttribute('file'),
				size				: part.getAttribute('size'),
				container			: part.getAttribute('container')
			});
		}
				
		media.push({
			id					: _media.getAttribute('id'),
			duration			: _media.getAttribute('duration'),
			bitrate				: _media.getAttribute('bitrate'),
			audioChannels		: _media.getAttribute('audioChannels'),
			audioCodec			: _media.getAttribute('audioCodec'),
			container			: _media.getAttribute('container'),
			parts				: parts
		});
	}

	return {
		ratingKey				: ratingKey,
		key						: key,
		container				: false,
		type					: type,
		title					: title,
		summary					: summary,
		thumb					: thumb,
		duration				: duration,
		addedAt					: addedAt,
		updatedAt				: updatedAt,
		parentTitle				: parentTitle,
		parentRatingKey			: parentRatingKey,
		parentIndex				: parentIndex,
		parentYear				: parentYear,
		parentKey				: parentKey,
		parentThumb				: parentThumb,
		grandparentTitle		: grandparentTitle,
		parts					: parts	
	};
}