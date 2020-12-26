export const DATE_FORMAT = 'MMM DD, YYYY';
export const DATETIME_FORMAT = 'MMM DD, YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';
export const DAY_FORMAT = 'ddd';

export const TRAFFIC_COLOUR_STEPS = [
  '#8CC788', // green/low traffic
  0,
  '#FAC758', // yellow/normal traffic
  10,
  '#F9874E', // red/high traffic
];
export const TrafficToColour = (score) => {
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
