chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	switch (message.action) {
		case 'getCookie': {
			chrome.cookies.get({
				url: 'https://soundcloud.com',
				name: message.cookie.name
			}, (cookie) => sendResponse(cookie));
			break;
		}
		case 'setCookie': {
			const cookie = {
				url: 'https://soundcloud.com',
				name: `${message.cookie.name}`,
				value: `${message.cookie.value}`,
				secure: message.cookie.secure,
				expirationDate: message.cookie.expirationDate,
			};
			chrome.cookies.set(cookie, () => sendResponse());
			break;
		}
		case 'removeCookie': {
			const cookie = {
				url: 'https://soundcloud.com',
				name: message.cookie.name
			};
			chrome.cookies.remove(cookie, () => sendResponse());
			break;
		}
		case "logout": {
			chrome.cookies.remove({
				url: 'https://api-auth.soundcloud.com',
				name: '_soundcloud_session',
			  }, () => sendResponse());
			break;
		}
	}
	return true;
});