import React from 'react';
import { useSelector } from 'react-redux';

import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';
import { TRAFFIC_COLOUR_STEPS } from '../common/Util';

const LAYER_DATA = {
  lineColor: [
    'step', ['get', 'average'],
    ...TRAFFIC_COLOUR_STEPS
  ],
  lineWidth: [
    'interpolate', ['linear'], ['zoom'],
    12, 0.5,
    14, 3
  ],
  lineOffset: 6,
};
const HITBOX_LAYER_DATA = {
  lineColor: 'transparent',
  lineWidth: 25,
  lineOffset: 15
};
const HIGHLIGHT_LAYER_DATA = {
  lineColor: [
    'step', ['get', 'average'],
    ...TRAFFIC_COLOUR_STEPS
  ],
  lineWidth: [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    8,
    0
  ],
  lineOffset: 6
};

const Generate = {
  layerId: (timestamp) => `path-lines-${timestamp}`,
  hitboxLayerId: (timestamp) => `path-hitboxes-${timestamp}`,
  highlightLayerId: (timestamp) => `path-highlights-${timestamp}`,
  sourceId: (timestamp) => `paths-${timestamp}`,
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
    if (snapshots.length === 0) {
      return {};
    }

    const pathMap = {};
    snapshots.forEach((snapshot) => {
      snapshot.data.forEach((datum) => {
        const legs = datum.path.legs;
        const average = datum.average;

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
          sourceData,
          featureId
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
    const layerId = Generate.layerId(selectedTime);
    const hitboxLayerId = Generate.hitboxLayerId(selectedTime);
    const highlightLayerId = Generate.highlightLayerId(selectedTime);
    const sourceId = Generate.sourceId(selectedTime);

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
          data={LAYER_DATA}
          id={layerId}
          source={sourceId}
          key={layerId}
        />
        <Layer
          type="line"
          data={HIGHLIGHT_LAYER_DATA}
          id={highlightLayerId}
          source={sourceId}
          key={highlightLayerId}
        />
        <Layer
          type="line"
          data={HITBOX_LAYER_DATA}
          id={hitboxLayerId}
          source={sourceId}
          key={hitboxLayerId}
          onMousemove={onPathMousemove}
          onMouseleave={onPathMouseleave}
        />
      </>
    );
  };

  const onPathClicked = (e) => {
    console.log(e.features[0].properties);
  };

  const onPathMousemove = (e, data) => {
    const { map, mapAttrs } = data;
    map.getCanvas().style.cursor = 'pointer';

    _unhoverCurrent(map, mapAttrs);

    if (e.features.length > 0) {
      const sourceId = Generate.sourceId(selectedTime);
      mapAttrs.hoverStateId = e.features[0].id;

      map.setFeatureState(
        { source: sourceId, id: mapAttrs.hoverStateId },
        { hover: true }
      );
    }
  };
  const onPathMouseleave = (e, data) => {
    const { map, mapAttrs } = data;
    map.getCanvas().style.cursor = '';

    _unhoverCurrent(map, mapAttrs);
  };
  const _unhoverCurrent = (map, mapAttrs) => {
    const { hoverStateId } = mapAttrs;
    const sourceId = Generate.sourceId(selectedTime);

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
