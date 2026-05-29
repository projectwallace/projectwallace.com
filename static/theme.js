(function () {
	var m = document.cookie.match(/(?:^|;\s*)theme=([^;]+)/);
	if (m) document.documentElement.setAttribute('data-theme', m[1]);
})();
