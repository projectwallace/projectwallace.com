// https://developer.chrome.com/blog/using-requestidlecallback

globalThis.requestIdleCallback =
	globalThis.requestIdleCallback ||
	function (cb) {
		var start = Date.now()
		return setTimeout(function () {
			cb({
				didTimeout: false,
				timeRemaining: function () {
					return Math.max(0, 50 - (Date.now() - start))
				}
			})
		}, 1)
	}

globalThis.cancelIdleCallback =
	globalThis.cancelIdleCallback ||
	function (id) {
		clearTimeout(id)
	}
