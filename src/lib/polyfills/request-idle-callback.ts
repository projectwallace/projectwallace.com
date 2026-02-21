// Polyfill requestIdleCallback for Safari
// https://gist.github.com/paullewis/55efe5d6f05434a96c36
globalThis.requestIdleCallback = globalThis.requestIdleCallback ||
	function (cb) {
		const start = Date.now()
		return setTimeout(function () {
			cb({
				didTimeout: false,
				timeRemaining: function () {
					return Math.max(0, 50 - (Date.now() - start))
				}
			})
		}, 1)
	}

globalThis.cancelIdleCallback = globalThis.cancelIdleCallback ||
	function (id) {
		clearTimeout(id)
	}
