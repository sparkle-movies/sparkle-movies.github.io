let workerVersion = "v1";

let appShell = [
	"https://xn--0ci.adam.tf/home",
	"https://xn--0ci.adam.tf/main.js",
	"https://xn--0ci.adam.tf/style.css"
];

self.addEventListener("install", event => {
	event.waitUntil(caches.open("sparkle-movies-" + workerVersion).then(c => {
		return c.addAll(appShell);
	}));
});

self.addEventListener("fetch", event => {
	if(event.request.method !== "GET") {
		return;
	}
	event.respondWith(caches.match(event.request).then(cached => {
		let networked = fetch(event.request)
			.then(networkFetch, noResolve)
			.catch(noResolve);
		
		return cached || networked;
		
		function networkFetch(response) {
			let cachedCopy = response.clone();
			
			caches.open("sparkle-movies-" + workerVersion).then(function add(cache) {
				cache.put(event.request, cachedCopy);
			});
			
			return response;
		}
		
		function noResolve() {
			return new Response("<h1>Service Unavailable</h1>", {
				status: 503,
				statusText: "Service Unavailable",
				headers: new Headers({
					"Content-Type": "text/html"
				})
			});
		}
	}));
});