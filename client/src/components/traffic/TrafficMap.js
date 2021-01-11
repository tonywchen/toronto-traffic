import React, { useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';

import { fetchPathDetail } from '../../actions/path';
import MapContext from '../common/MapContext';

import Layer from '../mapbox/Layer';
import Feature from '../mapbox/Feature';

import {
  LAYER_STYLES,
  HITBOX_LAYER_STYLES,
  HIGHLIGHT_LAYER_STYLES,
  GenerateId,
  createNumberIdFromPath,
  createNumberIdFromStop,
} from './TrafficMapUtil';

const TrafficMap = () => {
  const {map, mapAttrs} = useContext(MapContext);

  const trafficByTimestamp = useSelector(store => store.traffic.trafficByTimestamp);
  const selectedTime = useSelector(store => store.timeline.selected);

  const dispatch = useDispatch();

  useEffect(() => {
    map.on('sourcedata', onMapSourceData);
  }, [selectedTime])

  const onMapSourceData = (e) => {
    if (e.isSourceLoaded && map && mapAttrs) {
      const selectData = mapAttrs.selectData || {};
      const featureId = selectData.featureId;

      if (featureId) {
        map.setFeatureState(
          { source: e.sourceId, id: featureId },
          { select: true }
        );

        mapAttrs.selectData.sourceId = e.sourceId;
      }

      map.off('sourcedata', onMapSourceData);
    }
  };


  /**
   * Data Parsing Functions
   */

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

        const pathId = `${datum.path.from}--${datum.path.to}`;
        pathMap[pathId] = pathMap[pathId] || {
          sourceData,
          featureId: createNumberIdFromPath(datum.path.from, datum.path.to)
        };
        pathMap[pathId].sourceData = {
          ...sourceData,
          timestamp: snapshot.timestamp
        };

        stopMap[datum.path.from] = {
          coordinates: legs[0],
          featureId: createNumberIdFromStop(datum.path.from),
        };
        stopMap[datum.path.to] = {
          coordinates: legs[legs.length - 1],
          featureId: createNumberIdFromStop(datum.path.to),
        };
      });
    });

    return {
      pathMap,
      stopMap
    };
  };


  /**
   * Render Helper Functions
   */

  const renderTrafficPaths = (pathMap) => {
    const layerId = GenerateId.layerId(selectedTime);
    const hitboxLayerId = GenerateId.hitboxLayerId(selectedTime);
    const highlightLayerId = GenerateId.highlightLayerId(selectedTime);
    const pathSourceId = GenerateId.pathSourceId(selectedTime);

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
          data={LAYER_STYLES}
          id={layerId}
          source={pathSourceId}
          key={layerId}
          filter="LineString"
        />
        <Layer
          type="line"
          data={HIGHLIGHT_LAYER_STYLES}
          id={highlightLayerId}
          source={pathSourceId}
          key={highlightLayerId}
          filter="LineString"
        />
        <Layer
          type="line"
          data={HITBOX_LAYER_STYLES}
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


  /**
   * Map Interactivity Functions
   */

  const onPathClicked = (e) => {
    unselectCurrent(map, mapAttrs);

    if (e.features.length > 0) {
      const sourceId = GenerateId.pathSourceId(selectedTime);

      mapAttrs.selectData = {
        featureId: e.features[0].id,
        featureProps: e.features[0].properties,
        sourceId
      };

      map.setFeatureState(
        { source: sourceId, id: mapAttrs.selectData.featureId },
        { select: true }
      );

      console.log('onPathClicked', sourceId, mapAttrs.selectData.featureId);

      const onPathSelectionReset = () => {
        unselectCurrent(map, mapAttrs);
      };

      const { from, to, average, legs } = mapAttrs.selectData.featureProps;
      const legsArray = JSON.parse(legs); // need to "unstringified" because `legs` are stringified by Mapbox when assigned as custom properties

      dispatch(fetchPathDetail(from, to, average, selectedTime, legsArray, onPathSelectionReset));
    }
  };

  const onPathMousemove = (e) => {
    map.getCanvas().style.cursor = 'pointer';

    unhoverCurrent(map, mapAttrs);

    if (e.features.length > 0) {
      const sourceId = GenerateId.pathSourceId(selectedTime);
      mapAttrs.hoverData = {
        sourceId,
        featureId: e.features[0].id
      };

      map.setFeatureState(
        { source: sourceId, id: mapAttrs.hoverData.featureId },
        { hover: true }
      );
    }
  };

  const onPathMouseleave = () => {
    map.getCanvas().style.cursor = '';

    unhoverCurrent(map, mapAttrs);
  };

  const unselectCurrent = (map, mapAttrs) => {
    const selectData = mapAttrs.selectData || {};
    const { featureId, sourceId } = selectData;

    if (featureId && sourceId) {
      map.setFeatureState(
        { source: sourceId, id: featureId },
        { select: false }
      );

      mapAttrs.selectData = null;
    }
  };
  const unhoverCurrent = (map, mapAttrs) => {
    const hoverData = mapAttrs.hoverData || {};
    const { featureId, sourceId } = hoverData;

    if (featureId && sourceId) {
      map.setFeatureState(
        { source: sourceId, id: featureId },
        { hover: false }
      );

      mapAttrs.hoverData = null;
    }
  };


  /**
   * Render
   */

  if (!Number.isInteger(selectedTime)) {
    return null;
  }

  const { pathMap } = buildTrafficPaths(computeTrafficSnapshots());

  return (
    renderTrafficPaths(pathMap)
  );
};

export default TrafficMap;
