const fullListing = [];

setTimeout(() => {
	
	if(navigator.userAgent.indexOf("PlayStation") !== -1) {
		document.getElementById("app").style = "max-width: 90%";
	}
	
	if("serviceWorker" in navigator) {
		// TODO
		navigator.serviceWorker.register("/service-worker.js");
	}
	
	// populate our placeholder cards
	for(let i = 0; i < 15; i++) {
		document.getElementById("listing").innerHTML += skeleton.placeholderCard;
	}

	fetch("https://stream.adam.tf/list?key=" + document.cookie.split("key=")[1].split(";")[0])
		.then(r => r.json())
		.then(j => {
			if(j.error) {
				if(j.error == "Invalid key") {
					document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
					document.location.pathname = "/";
					return;
				}
			}
			j.files.forEach(f => {
				let newItem = true;
				fullListing.forEach(item => {
					if(f.description) {
						if(item.name == f.description.split("\n\n")[0])
							newItem = false;
					}
				});
				
				if(newItem) {
					if(f.description) {
						fullListing.push({
							name: f.description.split("\n\n")[0],
							resolutions: [ f.description.split("\n\n")[1] ],
							rating: f.description.split("\n\n")[2],
							metascore: f.description.split("\n\n")[3],
							poster: f.description.split("\n\n")[4],
							backdrop: f.description.split("\n\n")[5]
						});
					}
				} else {
					fullListing.forEach(item => {
						if(f.description) {
							if(item.name == f.description.split("\n\n")[0]) {
								item.resolutions.push(f.description.split("\n\n")[1]);
								item.resolutions.sort(a => {
									return parseInt(a.substring(0, a.length - 1));
								});
							}
						}
					});
				}
			});

		// sort alphabetically
		fullListing.sort((a, b) => a.name == b.name ? 0 : a.name < b.name ? -1 : 1);
		
		// clear our placeholder cards & populate with real ones
		document.getElementById("listing").innerHTML = "";
		fullListing.forEach(item => document.getElementById("listing").innerHTML += skeleton.card(item));
		
		if(document.location.hash != "") {
			document.querySelectorAll("div.watch[data-item-name]").forEach(e => {
				if(e.getAttribute("data-item-name") == decodeURIComponent(document.location.hash.replace("#/", ""))) {
					openPlayer(e);
				}
			})
		}
		
	}).catch(err => {
		console.log(err);
	});
	
}, 1);

window.onpopstate = event => {
	if(document.location.pathname == "/home") {
		if(window.playerOpen) {
			closePlayer(document.querySelector(".close"));
		}
	}
	if(document.location.hash != "") {
		let elements = document.querySelectorAll("div.watch[data-item-name]");
		elements.forEach(e => {
			if(e.getAttribute("data-item-name") == decodeURIComponent(document.location.hash.replace("#/", ""))) {
				openPlayer(e);
			}
		})
	}
}

// function to initialise the player
function openPlayer(watchButton) {
	
	let bg = document.getElementById("background-expand");
	bg.style = "opacity: 1; transform: translateY(0); pointer-events: all";
	
	let item;
	fullListing.forEach(i => {
		if(i.name == watchButton.getAttribute("data-item-name")) {
			item = i;
		}
	});
	
	bg.querySelector("#player-name").innerHTML = item.name;
	// todo: quality switching
	bg.querySelector("#video").src = "https://stream.adam.tf/" + item.name + " [1080p].mp4";
	bg.querySelector("#eng-sub").src = "https://stream.adam.tf/" + item.name + ".vtt";
	
	// fuck the history api
	document.location.hash = "#/" + item.name;
	
	if (typeof(Storage) !== "undefined") {
		if(localStorage.resume == undefined) {
			localStorage.resume = "{}";
		}
		let resume = JSON.parse(localStorage.resume);
		if(resume[watchButton.getAttribute("data-item-name")]) {
			bg.querySelector("#video").currentTime = resume[watchButton.getAttribute("data-item-name")];
		}
	}
}

// close the player
function closePlayer(xButton) {
	if(document.fullscreen) {
		document.exitFullscreen();
	}
	if(xButton == null) {
		return;
	}

	saveProgress(xButton.previousElementSibling.innerHTML, xButton.parentNode.nextElementSibling.currentTime);

	document.location.hash = "";
	
	let bg = document.getElementById("background-expand");
	bg.style = "";
	bg.querySelector("video").pause();
	bg.querySelector("video").removeAttribute("src");
	bg.querySelector("video").load();
	
	setTimeout(() => {
		bg.querySelector("#player-name").innerHTML = "";
	}, 500);
	
}

// update video play/pause button as the video starts/stops
function updateVideo(videoElement) {
	if(!videoElement.paused) {
		videoElement.nextElementSibling.querySelector("span.play-pause img").src = "/icon/pause.svg";
	} else {
		videoElement.nextElementSibling.querySelector("span.play-pause img").src = "/icon/play.svg";
	}
}

// update the scrollbar value as the video plays
function updateScrollbar(videoElement) {
	let value = videoElement.currentTime * (3840 / videoElement.duration);
	if(!window.videoScrollbarBeingUsed && videoElement.nextElementSibling !== null) {
		videoElement.nextElementSibling.querySelector("input[type=range]").value = value;
	}
}

// update the video playback position when the scrollbar is dragged
function updateVideoPosition(scrollbarElement, change) {
	if(change) {
		window.videoScrollbarBeingUsed = false;
		let newValue = scrollbarElement.value / (3840 / scrollbarElement.parentNode.previousElementSibling.duration);
		if(newValue != NaN && newValue != Infinity) {
			scrollbarElement.parentNode.previousElementSibling.currentTime = newValue;
		}
	} else window.videoScrollbarBeingUsed = true;
}

// toggle play/pause
function togglePlayPause(playPauseButton) {
	let video = playPauseButton;
	let actualButton = playPauseButton.nextElementSibling.querySelector("span.play-pause img");
	if(playPauseButton.tagName !== "VIDEO") {
		video = playPauseButton.closest(".player-footer").previousElementSibling;
		actualButton = playPauseButton.querySelector("img");
	}
	saveProgress(video.previousElementSibling.querySelector("h3").innerHTML, video.currentTime);
	if(!video.paused) {
		video.pause();
	} else video.play();
}

//toggle fullscreen
function toggleFullscreen(fullscreenButton) {
	if(document.fullscreen) {
		document.exitFullscreen();
	} else fullscreenButton.closest(".background-expand").requestFullscreen();
}

function saveProgress(title, time) {
	if (typeof(Storage) !== "undefined") {
		if(localStorage.resume == undefined) {
			localStorage.resume = "{}";
		}
		let resume = JSON.parse(localStorage.resume);
		resume[title] = time;
		localStorage.resume = JSON.stringify(resume);
	}
}