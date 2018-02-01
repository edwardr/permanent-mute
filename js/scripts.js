(function() {
	'use strict';

	var pageMute,
			closeModal,
			settingsLinkFetch,
			getMutedSites,
			saveMutedSite,
			removeMutedSite,
			getHostName,
			checkTabMute,
			isTabMuted,
			triggerBrowserIcon,
			storage = chrome.storage.local,

	closeModal = function() {
		window.close();
	}

	isTabMuted = function(tabId, info, tab) {
		var currTab,
				hostname,
				saved;

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			currTab = tabs[0];
			if (currTab.url) {
				hostname = getHostName(currTab.url);
				saved = [];
				storage.get('muted_sites', function(obj) {
					if( Object.keys(obj).length !== 0 ) {
						obj.muted_sites.forEach( function(v) {
							if( hostname == v ) {
								return true;
							}
						});
					}
				});
			}

			return false;
		});
	}

	triggerBrowserIcon = function(tab) {
		pageMute();
	}

	saveMutedSite = function(hostname) {
		var saved;
		saved = [];
		storage.get('muted_sites', function(obj) {
			if( Object.keys(obj).length !== 0 ) {
				obj.muted_sites.forEach( function(v) {
					saved.push(v);
				});
			}
			saved.push(hostname);
			storage.set({'muted_sites': saved }, function() {});
		});
	}

	removeMutedSite = function(hostname) {
		var saved;
		saved = [];
		storage.get('muted_sites', function(obj) {
			if( Object.keys(obj).length !== 0 ) {
				obj.muted_sites.forEach( function(v, i, o) {
					obj.muted_sites.splice(i, 1);
				});
			}
			storage.set({'muted_sites': obj.muted_sites }, function() {});
		});
	}

	checkTabMute = function(tabId, info, tab) {
		var currTab,
				hostname,
				saved;

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			currTab = tabs[0];
			if (currTab.url) {
				hostname = getHostName(currTab.url);
				saved = [];
				storage.get('muted_sites', function(obj) {
					if( Object.keys(obj).length !== 0 ) {
						obj.muted_sites.forEach( function(v) {
							if( hostname == v ) {

								chrome.tabs.update(currTab.id, {muted: true});
								chrome.browserAction.setIcon({
									path : "assets/icon48.png"
								});

								chrome.browserAction.setTitle({title: "This site is permanently muted."});

								return;
							}
						});
					}
				});
			}

			chrome.browserAction.setIcon({
				path : "assets/icon48-off.png"
			});

			chrome.browserAction.setTitle({title: "This site is not permanently muted."});
		});
	}

	getHostName = function(url) {
		var match;
		match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
		if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
			return match[2];
		} else {
			return '';
		}
	}

	pageMute = function() {
		var currTab, hostname;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			currTab = tabs[0];
			if (currTab) {
				hostname = getHostName(currTab.url);
				if( currTab.mutedInfo.muted == false ) {
					chrome.tabs.update(currTab.id, {muted: true});
					saveMutedSite(hostname);

					chrome.browserAction.setIcon({
						path : "assets/icon48.png"
					});

					chrome.browserAction.setTitle({title: "This site is permanently muted."});

				} else {
					chrome.tabs.update(currTab.id, {muted: false});
					removeMutedSite(hostname);


					chrome.browserAction.setIcon({
						path : "assets/icon48-off.png"
					});

					chrome.browserAction.setTitle({title: "This site is not permanently muted."});
				}
			}
		});
	}

	chrome.tabs.onActivated.addListener(checkTabMute);
	chrome.tabs.onUpdated.addListener(checkTabMute);
	chrome.browserAction.onClicked.addListener(triggerBrowserIcon);
	document.addEventListener('DOMContentLoaded', settingsLinkFetch);

})();