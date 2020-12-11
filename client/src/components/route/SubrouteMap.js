import React from 'react';
import { useSelector } from 'react-redux';

import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';

const SubrouteMap = () => {
  const subroutes = useSelector(store => store.route.subroutes);

  const layerData = {
    lineColor: "white",
    lineWidth: 5,
    lineOffset: 0
  };

  console.log(`subroutes: ${subroutes.length}`);

  return (
    <Layer type="line" data={layerData} id="subroute" source="subroute" key="subroute" >
      <Feature id="subroute" type="FeatureCollection">
        {
          subroutes.map(({legs, title}) => {
            const pathData = {
              legs: legs
            };

            return <Feature type="LineString" data={pathData} id={title} key={title} />;
          })
        }
      </Feature>
    </Layer>
  );
};

export default SubrouteMap;
