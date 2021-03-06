mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/mapbox/dark-v10",
	center: [13.4433, 52.5114],
	zoom: 10,
});

map.on("load", function () {
	map.addSource("events", {
		type: "geojson",

		data: events,
		cluster: true,
		clusterMaxZoom: 14,
		clusterRadius: 50,
	});

	map.addLayer({
		id: "clusters",
		type: "circle",
		source: "events",
		filter: ["has", "point_count"],
		paint: {
			"circle-color": [
				"step",
				["get", "point_count"],
				"#00BCD4",
				10,
				"#2196F3",
				30,
				"#3F51B5",
			],
			"circle-radius": [
				"step",
				["get", "point_count"],
				15,
				10,
				20,
				30,
				25,
			],
		},
	});

	map.addLayer({
		id: "cluster-count",
		type: "symbol",
		source: "events",
		filter: ["has", "point_count"],
		layout: {
			"text-field": "{point_count_abbreviated}",
			"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
			"text-size": 12,
		},
	});

	map.addLayer({
		id: "unclustered-point",
		type: "circle",
		source: "events",
		filter: ["!", ["has", "point_count"]],
		paint: {
			"circle-color": "#11b4da",
			"circle-radius": 4,
			"circle-stroke-width": 1,
			"circle-stroke-color": "#fff",
		},
	});

	map.on("click", "clusters", function (e) {
		const features = map.queryRenderedFeatures(e.point, {
			layers: ["clusters"],
		});
		const clusterId = features[0].properties.cluster_id;
		map.getSource("events").getClusterExpansionZoom(
			clusterId,
			function (err, zoom) {
				if (err) return;

				map.easeTo({
					center: features[0].geometry.coordinates,
					zoom: zoom,
				});
			}
		);
	});

	map.on("click", "unclustered-point", function (e) {
		const { popUpMarkup } = e.features[0].properties;
		console.log(e.features);
		const coordinates = e.features[0].geometry.coordinates.slice();

		while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		new mapboxgl.Popup()
			.setLngLat(coordinates)
			.setHTML(popUpMarkup)
			.addTo(map);
	});
	map.on("mouseenter", "clusters", function () {
		map.getCanvas().style.cursor = "pointer";
	});
	map.on("mouseleave", "clusters", function () {
		map.getCanvas().style.cursor = "";
	});
});
