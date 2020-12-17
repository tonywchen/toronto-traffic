import React from 'react';
import { useSelector } from 'react-redux';

import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';

const SubrouteMap = () => {
  const subroutes = useSelector(store => store.route.subroutes);
  const paths = useSelector(store => store.traffic.paths);

  const onPathClicked = (e) => {
    /* var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map); */

    console.log(e);
    console.log(e.features[0]);
  };

  const layerData = {
    lineColor: "#222222",
    lineWidth: 5,
    lineOffset: 5
  };

  return (
    <Layer type="line" data={layerData} id="subroute" source="subroute" key="subroute" onClick={onPathClicked}>
      <Feature id="subroute" type="FeatureCollection">
        {
          /* subroutes.map(({legs, title}) => {
            const pathData = {
              legs: legs
            };

            return <Feature type="LineString" data={pathData} id={title} key={title} />;
          }) */
          paths.map(({from, to, legs}) => {
            const pathData = {
              legs: legs,
              attributes: {
                from, to, legs
              }
            };
            const title = `pathDef_${from}-${to}`;

            return <Feature type="LineString" data={pathData} id={title} key={title}  />;
          })
        }
      </Feature>
    </Layer>
  );
};

export default SubrouteMap;
