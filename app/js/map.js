var map;

var melblat = -37.4;
var melblng = 144.95361;

var distPathLine;
var distPathPoints = new Array();
var routePathLine;
var routePathPoints = new Array();

var markers = new Array();
	
var geocoder;
google.maps.visualRefresh = true;

function initialize() {
	var mapProp = {
		center: new google.maps.LatLng(melblat,melblng),
		zoom: 8,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
	  
	distPath = new google.maps.Polyline({
		map: map,
		strokeColor: '#49599C',
		strokeOpacity: '0.75',
		strokeWeight: '6',
		path: distPathPoints
	});
	routePath = new google.maps.Polyline({
		map: map,
		strokeColor: '#49599C',
		strokeOpacity: '0.75',
		strokeWeight: '6',
		path: routePathPoints
	});
		
	geocoder = new google.maps.Geocoder();
}

function addSourceMarkerToAddress(input) {
	getLLFromAddress(input, function(coords){
		var marker = new google.maps.Marker({
			position: coords,
			map: map,
			title: input,
			icon: 'img/supplier_marker.png'
		});
	})
}

function addDestMarkerToAddress(input) {
	getLLFromAddress(input, function(coords){
		var marker = new google.maps.Marker({
			position: coords,
			map: map,
			title: input,
			icon: 'img/delivery_marker.png'
		});
	})
}

function addMarkerToAddress(input) {
	getLLFromAddress(input, addMarker);
}

function getLLFromAddress(input, func) {
	var ll;
	geocoder.geocode({
		address : input,
		region: 'no' 
		},
		function(results, status) {
			if (status.toLowerCase() == 'ok') {
				// Get center
				var coords = new google.maps.LatLng(
					results[0]['geometry']['location'].lat(),
					results[0]['geometry']['location'].lng()
				);
				func(coords);
			} else {
				console.log(status);
			}
		}
	);
}

function addMarker(latlng) {
	marker = new google.maps.Marker({
		position: latlng,		
		map: map
	});
}

function addRoutePathAddress(input) {
	getLLFromAddress(input, addRoutePathPoint);
}

function addRoutePathPoint(latlng) {
	routePathPoints[routePathPoints.length] = marker.getPosition();
	routePath.setPath(routePathPoints);
}

function setSourceDestAddress(sourceAdd, destAdd) {
	getLLFromAddress(destAdd, setDestLL);
	getLLFromAddress(sourceAdd, setSourceLL);
}

function setSourceLL(ll) {
	distPathPoints[distPathPoints.length] = ll;
	distPath.setPath(distPathPoints);
}

function setDestLL(ll) {
	distPathPoints[distPathPoints.length] = ll;
	distPath.setPath(distPathPoints);
}