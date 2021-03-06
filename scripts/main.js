var eventHandlerArray = new Array();

function getKeyCode(eventToGetKeyCode){
	var keyCodeFromEvent;
	if(window.event){ // IE 
	keyCodeFromEvent = eventToGetKeyCode.keyCode;
	}else if(eventToGetKeyCode.which) { // Netscape/Firefox/Opera
	keyCodeFromEvent = eventToGetKeyCode.which;
	}
	return keyCodeFromEvent;
}

function addEventHandler(obj, eventName, handler){
	//store adding events to use when confirm div is shown
	eventHandlerArray[eventHandlerArray.length] = [obj, eventName, handler];
	addEventHandlerWithOutSaving(obj, eventName, handler);	
}

function addEventHandlerWithOutSaving(obj, eventName, handler){
	if(document.attachEvent){
		obj.attachEvent("on" + eventName, handler);
	}else if(document.addEventListener){
		obj.addEventListener(eventName, handler, false);
	}
}

function removeEventHandler(obj, eventName, handler){
	if(document.detachEvent){
		obj.detachEvent("on" + eventName, handler);
	}else if(document.removeEventListener){
		obj.removeEventListener(eventName, handler, false);
	}
}

function keydownHandler(event) {
	var userInput = getKeyCode(event);
	
    try {
        switch (userInput) {
            case VK_UP:
                window.view.onUp();
                break;
            case VK_RIGHT:
                window.view.onRight();
                break;
            case VK_DOWN:
                window.view.onDown();
                break;
            case VK_LEFT:
                window.view.onLeft();
                break;
            case VK_ENTER:
                window.view.onEnter();
                break;
            case VK_BACK:
                window.view.onBack();
                break;
            case VK_STOP:
            case 19: // This is the stop button on B&O
                if (window.view.onStop) {
                    window.view.onStop();
                }
                break;
            case VK_PLAY:
                if (window.view.onPlay) {
                    window.view.onPlay();
                }
                break;
            case VK_PAUSE:
                if (window.view.onPause()) {
                    window.view.onPause();
                }
                break;
            case VK_FAST_FWD:
                if (window.view.onFF) {
                    window.view.onFF();
                }
                break;
            case VK_REWIND:
                if (window.view.onRew) {
                    window.view.onRew();
                }
                break;
            case VK_PAGE_UP:
                if (window.view.onPageUp) {
                    window.view.onPageUp();
                }
                break;
            case VK_PAGE_DOWN:
                if (window.view.onPageDown) {
                    window.view.onPageDown();
                }
                break;
            case VK_RED:
                if (window.view.onRed) {
                    window.view.onRed();
                }
                break;
            case VK_GREEN:
                if (window.view.onGreen) {
                    window.view.onGreen();
                }
                break;
            case VK_BLUE:
                if (window.view.onBlue) {
                    window.view.onBlue();
                }
                break;
            case VK_YELLOW:
                if (window.view.onYellow) {
                    window.view.onYellow();
                }
                break;
            default:
                break;
        }
    }
    catch (err) {
        console.log('FATAL:' + err);
        throw err;
    }
}

function showInfo(message) {
	var infoContainer = document.getElementById('info');
	
	infoContainer.style.top = window.offsetHeight;
	
	infoContainer.setAttribute('class', 'vertical-transtion');
	
	infoContainer.innerHTML = message;
	
	infoContainer.style.top = (window.offsetHeight - infoContainer.offsetHeight);
	
	setTimeout(function() {
		infoContainer.style.top = window.offsetHeight;
	}, (10 * 1000));
}

function initPage() {    
    addEventHandler(document.body, 'keydown', keydownHandler);

    var initialized = Settings.init();
    
    if (!initialized)
        window.view = new SettingsView();
    else
        window.view = new HomeView();
        
    window.view.render();
}