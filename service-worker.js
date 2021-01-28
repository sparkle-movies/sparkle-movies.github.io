let workerVersion = "v1";

let appShell = [
	"/home/index.html",
	"/main.js",
	"/style.css"
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
			.catch(noResolve);
		
		return cached || networked;
		
		function noResolve(err) {
			console.log(err);
			return new Response("{'error': 'Service unavailable'}", { status: 503 });
		}
	}));
});