function getUsername() {
	return document.getElementsByClassName('header__userNavUsernameButton')[0]?.href.split('/').pop();
}

function getCache() {
	return JSON.parse(localStorage.getItem('scs_cache')) || {};
}

function save() {
	chrome.runtime.sendMessage({action: 'getCookie', cookie: { name: 'oauth_token'}}, (cookie) => {
		const username = getUsername();
		if (!username || !cookie) return;
		cookie.name = `scs_${username}`;
		chrome.runtime.sendMessage({action: 'setCookie', cookie: cookie});
		const icon  = document.getElementsByClassName('image header__userNavItem header__userNavAvatar')[0].getElementsByTagName('span')[0].style.backgroundImage;
		const cache = getCache();
		cache[username] = {
			avatar: `${icon}`
		};
		localStorage.setItem(`scs_cache`, JSON.stringify(cache));
  	});
}

function remove(username) {
	const cache = getCache();
	delete cache[username];
	localStorage.setItem(`scs_cache`, JSON.stringify(cache));

	chrome.runtime.sendMessage({action: 'removeCookie', cookie: { name: `scs_${username}`}});

	logout();

	if (Object.keys(cache).length) switchAccounts(Object.keys(cache)[0]);
}

function logout() {
	chrome.runtime.sendMessage({action: 'removeCookie', cookie: { name: 'oauth_token'}}, () => {
		chrome.runtime.sendMessage({ action: 'logout' }, () => window.location = 'https://soundcloud.com/signin');
	});
}

function switchAccounts(username) {
	save();
	chrome.runtime.sendMessage({action: 'getCookie', cookie: { name: `scs_${username}`}}, (cookie) => {
		cookie.name = 'oauth_token';
		chrome.runtime.sendMessage({action: 'setCookie', cookie: cookie}, () => location.reload());
	});
}

const observer = new MutationObserver((mutations) => {
	mutations.forEach(mutation => {
		if (mutation.target.classList?.contains('header__userNav')) save();

		if (Array.from(mutation.addedNodes).some(node => node.classList?.contains('profileMenu'))) {
			const dropdownList = document.querySelector('.profileMenu');
			if (!dropdownList) return;

			/* add account */
			const accountList = document.createElement('li');
			accountList.setAttribute('class', 'sc-list-nostyle');
			const accountLabel = document.createElement('a');
			accountLabel.setAttribute('class', 'sc-classic headerMenu__link profileMenu__profile');
			accountLabel.textContent = 'Add Account';
			accountLabel.href = '#';
			accountLabel.onclick = () => {
				save();
				logout();
			};
			accountList.appendChild(accountLabel);
			dropdownList.appendChild(accountList);

			const cache = getCache();
			for (let username in cache) {

				const style = document.createElement('style');
				style.textContent = `.scs__${username}:after { background-size: contain; background-position: center; background-image: ${cache[username].avatar}; }`;
				document.head.appendChild(style);

				const li = document.createElement('li');
				li.setAttribute('class', 'sc-list-nostyle');
				
				const a = document.createElement('a');
				a.setAttribute('class', `sc-classic headerMenu__link scs__${username}`);
				a.textContent = username;
				a.style.display = 'inline-block';
				a.href = '#';
				a.onclick = () => {
					save();
					switchAccounts(username);
				};

				const delStyle = document.createElement('style');
				delStyle.textContent = `.scs__del { 
					'display: inline-block; 
					float: right; 
					opacity: 0; 
					cursor: pointer; 
				} 
				
				.scs__del:hover { 
					opacity: 1; 
				}`;
				document.head.appendChild(delStyle);

				const del = document.createElement('span');
				del.innerHTML = '&times;';
				del.setAttribute('class', 'scs__del');
				del.onclick = () => {
					if (confirm(`Are you sure you want to remove '${username}'?`)) remove(username);
				};
				li.appendChild(a);
				li.appendChild(del);
				dropdownList.appendChild(li);
			}
		}
	});
});

observer.observe(document.body, { childList: true, subtree: true });

function init() {
	const username = getUsername();
	chrome.runtime.sendMessage({action: 'getCookie', cookie: { name: `scs_${username}`}}, (cookie) => {
		if (!cookie) save();
	});
}

init();