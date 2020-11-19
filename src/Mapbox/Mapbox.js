import React, { useState, useRef, useEffect } from 'react';
import MapboxGl from 'mapbox-gl';

const DEFAULT = {
    lng: 5,
    lat: 34,
    zoom: 2
};

const Mapbox = () => {
    const [lng, setLng] = useState(DEFAULT.lng);
    const [lat, setLat] = useState(DEFAULT.lat);
    const [zoom, setZoom] = useState(DEFAULT.zoom);

    const mapContainer = useRef(null);

    useEffect(() => {
        new MapboxGl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom
        });
      });

    return (
        <div className="mapbox-container" ref={mapContainer}>  
        </div>
    )
};

export default Mapbox;