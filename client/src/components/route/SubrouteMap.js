import React from 'react';
import { useSelector } from 'react-redux';

import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';

const SubrouteMap = () => {
  const paths = useSelector(store => store.traffic.paths);

  const onPathClicked = (e) => {
    console.log(e.features[0]);
  };

  const layerData = {
    lineColor: "#222222",
    // lineWidth: 5,
    lineWidth: [
      'interpolate', ['linear'], ['zoom'],
      12, 1,
      14, 5
    ],
    lineOffset: 6
  };

  return (
    <Layer type="line" data={layerData} id="subroute" source="subroute" key="subroute" onClick={onPathClicked}>
      <Feature id="subroute" type="FeatureCollection">
        {
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
