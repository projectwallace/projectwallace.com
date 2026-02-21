// Polyfill scheduler.yield for browsers that don't support it
// https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield

scheduler = scheduler || {}

scheduler.yield = scheduler.yield ||
	function () {
		return new Promise<void>((resolve) => {
			setTimeout(resolve, 0)
		})
	}
