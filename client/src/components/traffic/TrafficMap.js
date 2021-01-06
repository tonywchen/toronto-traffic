import React from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';
import { TRAFFIC_COLOUR_STEPS } from '../common/Util';

import { fetchPathDetail } from '../../actions/path';

const LINE_COLOUR_STEPPED = [
  'step', ['get', 'average'],
  ...TRAFFIC_COLOUR_STEPS
];

const LAYER_DATA = {
  lineColor: LINE_COLOUR_STEPPED,
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
  lineColor: LINE_COLOUR_STEPPED,
  lineWidth: [
    'case',
    ['boolean', ['feature-state', 'hover'], false], 8,
    ['boolean', ['feature-state', 'focus'], false], 6,
    0
  ],
  lineOffset: 6
};
const FOCUS_LAYER_DATA = {
  lineColor: 'white',
  lineWidth: [
    'case',
    ['boolean', ['feature-state', 'focus'], false], 12,
    0
  ],
  lineOffset: 6
};
const HIGHLIGHT_POINT_LAYER_DATA = {
  circleColor: 'white',
  circleRadius: [
    'interpolate', ['linear'], ['zoom'],
    12, 1,
    14, 4
  ],
  circleStrokeColor: '#171717',
  circleStrokeWidth: [
    'interpolate', ['linear'], ['zoom'],
    12, 1,
    14, 2
  ],
};

const Generate = {
  layerId: (timestamp) => `path-lines-${timestamp}`,
  hitboxLayerId: (timestamp) => `path-hitboxes-${timestamp}`,
  highlightLayerId: (timestamp) => `path-highlights-${timestamp}`,
  focusLayerId: (timestamp) => `path-focuses-${timestamp}`,
  pathSourceId: (timestamp) => `paths-${timestamp}`,
  stopSourceId: (timestamp) => `stops-${timestamp}`,
  stopHighlightLayerId: (timestamp) => `stop-highlights-${timestamp}`
};

let pathNumberId = 1;
const pathToNumberIdMap = {};
const getNumberIdFromPath = (from, to) => {
  const identifier = `${from}_${to}`;
  pathToNumberIdMap[identifier] = pathToNumberIdMap[identifier] || pathNumberId++;

  return pathToNumberIdMap[identifier];
};

let stopNumberId = 1;
const stopToNumberIdMap = {};
const getNumberIdFromStop = (stopId) => {
  const identifier = `${stopId}`;
  stopToNumberIdMap[identifier] = stopToNumberIdMap[identifier] || stopNumberId++;

  return stopToNumberIdMap[identifier];
};

const TrafficMap = () => {
  const trafficByTimestamp = useSelector(store => store.traffic.trafficByTimestamp);
  const selectedTime = useSelector(store => store.timeline.selected);

  const dispatch = useDispatch();

  const computeTrafficSnapshots = () => {
    const traffic = trafficByTimestamp[selectedTime];
    return (traffic)
      ? [traffic]
      : [];
  };

  const buildTrafficPaths = (snapshots) => {
    if (snapshots.length === 0) {
      return {
        pathMap: {},
        stopMap: {}
      };
    }

    const pathMap = {};
    const stopMap = {};
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
        pathMap[pathId] = pathMap[pathId] || {
          sourceData,
          featureId: getNumberIdFromPath(datum.path.from, datum.path.to)
        };
        pathMap[pathId].sourceData = {
          ...sourceData,
          timestamp: snapshot.timestamp
        };

        stopMap[datum.path.from] = {
          coordinates: legs[0],
          featureId: getNumberIdFromStop(datum.path.from),
        };
        stopMap[datum.path.to] = {
          coordinates: legs[legs.length - 1],
          featureId: getNumberIdFromStop(datum.path.to),
        };
      });
    });

    return {
      pathMap,
      stopMap
    };
  };

  const renderTrafficPaths = (pathMap) => {
    const layerId = Generate.layerId(selectedTime);
    const hitboxLayerId = Generate.hitboxLayerId(selectedTime);
    const highlightLayerId = Generate.highlightLayerId(selectedTime);
    const focusLayerId = Generate.focusLayerId(selectedTime);
    const pathSourceId = Generate.pathSourceId(selectedTime);

    return (
      <>
        <Feature type="FeatureCollection" id={pathSourceId}>
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
          source={pathSourceId}
          key={layerId}
          filter="LineString"
        />
        <Layer
          type="line"
          data={FOCUS_LAYER_DATA}
          id={focusLayerId}
          source={pathSourceId}
          key={focusLayerId}
          filter="LineString"
        />
        <Layer
          type="line"
          data={HIGHLIGHT_LAYER_DATA}
          id={highlightLayerId}
          source={pathSourceId}
          key={highlightLayerId}
          filter="LineString"
        />
        <Layer
          type="line"
          data={HITBOX_LAYER_DATA}
          id={hitboxLayerId}
          source={pathSourceId}
          key={hitboxLayerId}
          onClick={onPathClicked}
          onMousemove={onPathMousemove}
          onMouseleave={onPathMouseleave}
          filter="LineString"
        />
      </>
    );
  };

  const onPathClicked = (e, data) => {
    const { map, mapAttrs } = data;

    _unfocusCurrent(map, mapAttrs);

    if (e.features.length > 0) {
      const sourceId = Generate.pathSourceId(selectedTime);
      mapAttrs.focusStateId = e.features[0].id;

      map.setFeatureState(
        { source: sourceId, id: mapAttrs.focusStateId },
        { focus: true }
      );

      console.log(mapAttrs);

      const { from, to, average } = e.features[0].properties;
      dispatch(fetchPathDetail(from, to, average, selectedTime));
    }
  };
  const _unfocusCurrent = (map, mapAttrs) => {
    const { focusStateId } = mapAttrs;
    const sourceId = Generate.pathSourceId(selectedTime);

    if (focusStateId) {
      map.setFeatureState(
        { source: sourceId, id: focusStateId },
        { focus: false }
      );

      mapAttrs.focusStateId = null;
    }
  };

  const onPathMousemove = (e, data) => {
    const { map, mapAttrs } = data;
    map.getCanvas().style.cursor = 'pointer';

    _unhoverCurrent(map, mapAttrs);

    if (e.features.length > 0) {
      const sourceId = Generate.pathSourceId(selectedTime);
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
    const sourceId = Generate.pathSourceId(selectedTime);

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

  const { pathMap } = buildTrafficPaths(computeTrafficSnapshots());

  return (
    renderTrafficPaths(pathMap)
  );
};

export default TrafficMap;
