import React from 'react';
import { useSelector } from 'react-redux';
import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';

const TRAFFIC_COLOUR = (score) => {
  if (score > 10) {
    return '#F9874E';
  } else if (score < -10) {
    return '#8CC788';
  } else {
    return '#FAC758';
  }
};

let numberId = 1;
const pathToNumberIdMap = {};
const getNumberIdFromPath = (from, to) => {
  const identifier = `${from}_${to}`;
  pathToNumberIdMap[identifier] = pathToNumberIdMap[identifier] || numberId++;

  return pathToNumberIdMap[identifier];
};

const TrafficMap = () => {
  const trafficByTimestamp = useSelector(store => store.traffic.trafficByTimestamp);
  const selectedTime = useSelector(store => store.timeline.selected);

  const computeTrafficSnapshots = () => {
    const traffic = trafficByTimestamp[selectedTime];
    return (traffic)
      ? [traffic]
      : [];
  };

  const buildTrafficPaths = (snapshots) => {
    const pathMap = {};
    Object.values(pathMap).forEach((path) => {
      path.layerData = path.layerData || {};
      path.layerData.lineColor = 'transparent';
    });

    if (snapshots.length === 0) {
      return {};
    }

    snapshots.forEach((snapshot, index) => {
      const opacity = 1; // (index + 1) / snapshots.length;

      snapshot.data.forEach((datum) => {
        const legs = datum.path.legs;
        const average = datum.average;
        const colour = TRAFFIC_COLOUR(average);

        const layerData = {
          colour,
          opacity
        };
        const sourceData = {
          legs,
          attributes: {
            from: datum.path.from,
            to: datum.path.to,
            timestamp: snapshot.timestamp,
            average: average,
            legs
          }
        };

        const pathId = `${datum.path.from}_${datum.path.to}`;
        const featureId = getNumberIdFromPath(datum.path.from, datum.path.to); // Mapbox feature id has to be numerical
        pathMap[pathId] = pathMap[pathId] || {
          layerData,
          sourceData,
          featureId
        };

        pathMap[pathId].layerData = {
          ...layerData,
          // lineColor: colour,
          lineColor: [
            'step', ['get', 'average'],
            '#8CC788',
            -10,
            '#FAC758',
            10,
            '#F9874E'
          ],
          // lineWidth: 3,
          lineWidth: [
            'interpolate', ['linear'], ['zoom'],
            12, 0.5,
            14, 3
          ],
          lineWidth: [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            6,
            3
          ],
          lineOffset: 5,
          opacity
        };
        pathMap[pathId].sourceData = {
          ...sourceData,
          timestamp: snapshot.timestamp
        };
      });
    });

    return pathMap;
  };

  const renderTrafficPaths = (pathMap) => {
    const layerData = {
      lineColor: [
        'step', ['get', 'average'],
        '#8CC788',
        -10,
        '#FAC758',
        10,
        '#F9874E'
      ],
      lineWidth: [
        'interpolate', ['linear'], ['zoom'],
        12, 0.5,
        14, 3
      ],
      /* lineWidth: [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        6,
        3
      ], */
      lineOffset: 5,
    };
    const layerId = `path-lines-${selectedTime}`;

    const hitboxLayerData = {
      lineColor: 'rgba(255, 255, 255, 0.5)',
      lineWidth: 5,
      lineOffset: 5
    };
    const hitboxLayerId = `path-hitbox-${selectedTime}`;

    const sourceId = `paths-${selectedTime}`;

    return (
      <>
        <Feature type="FeatureCollection" id={sourceId}>
          {
            Object.keys(pathMap).map((pathId) => {
              const { sourceData, featureId } = pathMap[pathId];
              return (
                <Feature data={sourceData} id={pathId} featureId={featureId} key={pathId} type="LineString"/>
              );
            })
          }
        </Feature>
        <Layer
          type="line"
          data={layerData}
          id={layerId}
          source={sourceId}
          key={layerId}
          onClick={onPathClicked}
          onMousemove={onPathMousemove}
          onMouseleave={onPathMouseleave}
        />
        <Layer
          type="line"
          data={hitboxLayerData}
          id={hitboxLayerId}
          source={sourceId}
          key={hitboxLayerId}
          onClick={onPathClicked}
          onMousemove={onPathMousemove}
          onMouseleave={onPathMouseleave}
        />
      </>
    );
  };

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
    console.log(e.features[0].properties);
  };

  const onPathMousemove = (e, data) => {
    const { map, mapAttrs, sourceId } = data;
    map.getCanvas().style.cursor = 'pointer';

    if (e.features.length > 0) {
      mapAttrs.hoverStateId = e.features[0].id;

      map.setFeatureState(
        { source: sourceId, id: mapAttrs.hoverStateId },
        { hover: true }
      );
    }
  };
  const onPathMouseleave = (e, data) => {
    const { map, mapAttrs, sourceId } = data;
    const { hoverStateId } = mapAttrs;
    map.getCanvas().style.cursor = '';

    if (hoverStateId) {
      map.setFeatureState(
        { source: sourceId, id: hoverStateId },
        { hover: false }
      );

      mapAttrs.hoverStateId = null;
    }
  };

  if (!Number.isInteger(selectedTime)) {
    return null;
  }

  const pathMap = buildTrafficPaths(computeTrafficSnapshots());

  return (
    renderTrafficPaths(pathMap)
  );
};

export default TrafficMap;
