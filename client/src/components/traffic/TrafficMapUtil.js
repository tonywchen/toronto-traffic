import { TRAFFIC_COLOUR_STEPS } from '../common/Util';

export const LINE_COLOUR_STEPPED = [
  'step', ['get', 'average'],
  ...TRAFFIC_COLOUR_STEPS
];

export const LAYER_STYLES = {
  lineColor: LINE_COLOUR_STEPPED,
  lineWidth: [
    'interpolate', ['linear'], ['zoom'],
    12, 0.5,
    14, 3
  ],
  lineOffset: 6,
};
export const HITBOX_LAYER_STYLES = {
  lineColor: 'transparent',
  lineWidth: 25,
  lineOffset: 15
};
export const HIGHLIGHT_LAYER_STYLES = {
  lineColor: LINE_COLOUR_STEPPED,
  lineWidth: [
    'case',
    ['boolean', ['feature-state', 'hover'], false], 8,
    ['boolean', ['feature-state', 'select'], false], 6,
    0
  ],
  lineOffset: 6
};
export const FOCUS_LAYER_STYLES = {
  lineColor: 'white',
  lineWidth: [
    'case',
    ['boolean', ['feature-state', 'select'], false], 12,
    0
  ],
  lineOffset: 6
};
export const HIGHLIGHT_POINT_LAYER_STYLES = {
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

export const GenerateId = {
  layerId: (timestamp) => `path-lines-${timestamp}`,
  hitboxLayerId: (timestamp) => `path-hitboxes-${timestamp}`,
  highlightLayerId: (timestamp) => `path-highlights-${timestamp}`,
  pathSourceId: (timestamp) => `paths-${timestamp}`,
  stopSourceId: (timestamp) => `stops-${timestamp}`,
  stopHighlightLayerId: (timestamp) => `stop-highlights-${timestamp}`
};

let pathNumberId = 1;
const pathToNumberIdMap = {};
export const createNumberIdFromPath = (from, to) => {
  const result = getNumberIdFromPath(from, to);
  pathNumberId++;

  return result;
};
export const getNumberIdFromPath = (from, to) => {
  const identifier = `${from}--${to}`;
  pathToNumberIdMap[identifier] = pathToNumberIdMap[identifier] || pathNumberId;

  return pathToNumberIdMap[identifier];
};

let stopNumberId = 1;
const stopToNumberIdMap = {};
export const createNumberIdFromStop = (stopId) => {
  const identifier = `${stopId}`;
  stopToNumberIdMap[identifier] = stopToNumberIdMap[identifier] || stopNumberId++;

  return stopToNumberIdMap[identifier];
};
