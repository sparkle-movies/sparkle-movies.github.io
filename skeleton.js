const skeleton = {
	card: (item) => `
		<figure>
			<div class="front">
				<div class="loading-image" style="background-image: url('https://image.tmdb.org/t/p/w200/${item.poster}.jpg')"></div>
			</div>
			<div class="back">
				<h2 title="${item.name.replace(/\s\([0-9]{4}\)$/, "")}">${item.name.replace(/\s\([0-9]{4}\)$/, "")}</h2>
				<div class="stats">
					<div>${item.name.substring(item.name.length - 5, item.name.length - 1)}</div>
					<div style="opacity: 0.25">•</div>
					<div title="MPAA Rating">${item.rating}</div>
					<div style="opacity: 0.25">•</div>
					<div title="Metascore (via Metacritic)">
						${item.metascore} <span class="metascore"></span>
					</div>
				</div>
				<div class="watch" data-item-name="${item.name}" onclick="openPlayer(this)">▶ Watch</div>
			</div>
			<div class="background" style="background-image: linear-gradient(rgba(0,0,0,0.5), rgb(0,0,0)), url('https://image.tmdb.org/t/p/w300/${item.backdrop}.jpg')"></div>
			<div class="background-expand"></div>
		</figure>
	`,
	placeholderCard: `
		<figure style="pointer-events: none">
			<div class="front">
				<div class="loading-image"></div>
			</div>
		</figure>
	`
};