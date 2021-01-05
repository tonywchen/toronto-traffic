import _ from 'lodash';

export const DATE_FORMAT = 'MMM DD, YYYY';
export const DATETIME_FORMAT = 'HH:mm MMM DD, YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DAY_FORMAT = 'ddd';

export const TRAFFIC_COLOUR_STEPS = [
  '#8CC788', // green/low traffic
  0,
  '#FAC758', // yellow/normal traffic
  10,
  '#F9874E', // red/high traffic
];
export const trafficToColour = (score) => {
  const numSteps = Math.floor(TRAFFIC_COLOUR_STEPS.length / 2);

  for (let i = 0; i < numSteps; i++) {
    const colour = TRAFFIC_COLOUR_STEPS[i * 2];
    const step = TRAFFIC_COLOUR_STEPS[i * 2 + 1];

    if (score < step) {
      return colour;
    }
  }

  return TRAFFIC_COLOUR_STEPS[numSteps * 2];
};

export const trafficToPreview = (source) => {
  return (timestamps) => {
    let max = 0;
    timestamps.forEach((timestamp) => {
      const element = source[timestamp];
      if (!element) {
        return 0;
      }

      const sum = _.sumBy(element.data, 'weight');
      max = Math.max(max, sum);
    });

    const results = timestamps.map((timestamp) => {
      const element = source[timestamp];
      if (!element) {
        return {
          x: null
        }
      }

      const totalWeight = _.sumBy(element.data, 'weight');
      const totalScore = _.sumBy(element.data, 'score');
      const color = trafficToColour(totalScore / totalWeight);
      const x = totalWeight / max;

      return {
        x,
        data: {
          color
        }
      };
    });

    return results;
  }
};
