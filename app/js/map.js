			var map;
			
			var melblat = -37.84449;
			var melblng = 144.95361;
			
			var distPathLine;
			var distPathPoints = new Array();
			var routePathLine;
			var routePathPoints = new Array();
			
			var markers = new Array();
				
			var geocoder;
		
			function initialize()
			{
				var mapProp = {
				  center:new google.maps.LatLng(melblat,melblng),
				  zoom:8,
				  mapTypeId:google.maps.MapTypeId.ROADMAP
				  };
				map=new google.maps.Map(document.getElementById("googleMap")
				  ,mapProp);
				  
				distPath = new google.maps.Polyline({
						map: map,
						strokeColor: '#FF0000',
						strokeOpacity: '0.75',
						strokeWeight: '8',
						path: distPathPoints
					});
				routePath = new google.maps.Polyline({
						map: map,
						strokeColor: '#FF0000',
						strokeOpacity: '0.75',
						strokeWeight: '8',
						path: routePathPoints
					});
					
				geocoder = new google.maps.Geocoder();
			}
			
			function addSourceMarker(latlng)
			{
				marker = new google.maps.Marker({
						position: latlng, //new google.maps.LatLng(lat,lng),
						map: map,
						icon: 'img/farmer_marker_point.png'
					});
			}
			
			function addDestMarker(latlng)
			{
				marker = new google.maps.Marker({
						position: latlng, //new google.maps.LatLng(lat,lng),
						map: map,
						icon: 'img/hub_marker_point.png'
					});
			}
			
			function addSourceMarkerToAddress(input)
			{
				getLLFromAddress(input, addSourceMarker);
			}
			function addDestMarkerToAddress(input)
			{
				getLLFromAddress(input, addDestMarker);
			}
			
			function addMarkerToAddress(input)
			{
				getLLFromAddress(input, addMarker);
			}
			
			function getLLFromAddress(input, func)
			{
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
							ll = coords;
							func(ll);		
						} else {
                console.log(status);
            }
					}
				);
			}
			
			function addMarker(latlng)
			{
				marker = new google.maps.Marker({
						position: latlng, //new google.maps.LatLng(lat,lng),
						map: map
					});
			}
			
			function addRoutePathAddress(input)
			{
				getLLFromAddress(input, addRoutePathPoint);
			}
			
			function addRoutePathPoint(latlng)
			{
				routePathPoints[routePathPoints.length] = marker.getPosition();
				routePath.setPath(routePathPoints);
			}
			
			function setSourceDestAddress(sourceAdd, destAdd)
			{
				getLLFromAddress(destAdd, setDestLL);
				getLLFromAddress(sourceAdd, setSourceLL);
			}
			
			function setSourceLL(ll){
				distPathPoints[distPathPoints.length] = ll;
				distPath.setPath(distPathPoints);
			}
			function setDestLL(ll){
				distPathPoints[distPathPoints.length] = ll;
				distPath.setPath(distPathPoints);
			}
