const xml2js = require('xml2js');
const _ = require('lodash');

const axios = require('axios');
axios.interceptors.request.use(function (config) {
  config.metadata = {
    startTime: new Date()
  };
  return config;
}, function (error) {
  return Promise.reject(error);
});
axios.interceptors.response.use(function (response) {
  response.config.metadata.endTime = new Date();
  response.headers['request-duration'] = response.config.metadata.endTime - response.config.metadata.startTime
  return response;
}, function (error) {
  return Promise.reject(error);
});

const BASE_URL = 'http://webservices.nextbus.com/service/publicXMLFeed?';
const AGENCY = 'ttc';

const buildQueryString = ({ command, params = {} }) => {
  const paramStringList = Object.keys(params).map((key) => {
    const value = params[key];

    if (value == undefined || value == null) {
      return '';
    } else {
      if (!Array.isArray(value)) {
        return `${key}=${value}`;
      }

      const arrayParamStringList = value.map((v) => {
        return `${key}=${v}`;
      });

      return arrayParamStringList.join('&');
    }
  });

  paramStringList.unshift(`command=${command}`);

  return paramStringList.join('&');
};

const NextbusService = {
  fetch: async ({ command, params = {} }) => {
    const queryString = buildQueryString({ command, params });
    const requestUrl = BASE_URL + queryString;

    try {
      const response = await axios.get(requestUrl);
      const jsonData = await xml2js.parseStringPromise(response.data);

      return jsonData.body;
    } catch (e) {
      throw e;
    }
  },

  fetchRoute: async (route) => {
    const params = {
      a: AGENCY,
      r: route
    };

    const result = await NextbusService.fetch({
      command: 'routeConfig',
      params: params
    });

    const stops = result.route[0].stop.map((s) => {
      return {
        ...s.$,
        routeTag: route
      };
    });

    const directions = result.route[0].direction.map((d) => {
      const directionStops = d.stop.map(s => s.$);
      return {
        ...d.$,
        stops: directionStops
      };
    });

    return {
      stops,
      directions
    };
  },

  fetchPredictions: async (route, directionTag, stops, currentTimestamp) => {
    if (!stops) {
      return null;
    };

    const compoundStops = stops.map((stop) => {
      return `${route}|${directionTag}|${stop.tag}`;
    });

    const params = {
      a: AGENCY,
      stops: compoundStops
    };

    const result = await NextbusService.fetch({
      command: 'predictionsForMultiStops',
      params: params
    });

    const allStopPredictions = [];
    result.predictions.forEach((stop) => {
      if (!stop.direction) {
        return;
      }

      stop.direction.forEach((direction) => {
        direction.prediction.forEach((prediction) => {
          const stopPrediction = {
            ...prediction.$,
            routeTag: stop.$.routeTag,
            routeTitle: stop.$.routeTitle,
            stopTag: stop.$.stopTag,
            stopTitle: stop.$.stopTitle
          };

          allStopPredictions.push(stopPrediction);
        });
      });
    });

    const groupedPredictions = allStopPredictions.reduce((acc, prediction) => {
      const { tripTag, routeTag, routeTitle, dirTag, branch, stopTag } = prediction;
      acc[tripTag] = acc[tripTag] || {
        timestamp: currentTimestamp,
        tripTag,
        routeTag,
        routeTitle,
        dirTag,
        branch,
        predictions: {}
      };

      acc[tripTag].predictions[stopTag] = {
        seconds: prediction.seconds,
        stopTag: prediction.stopTag,
        stopTitle: prediction.stopTitle,
        isDeparture: prediction.isDeparture,
        vehicle: prediction.vehicle
      };

      return acc;
    }, {});

    Object.values(groupedPredictions).forEach((trip) => {
      const { predictions } = trip;
      const predictionList = Object.values(predictions);

      const nextStopTags = _.chain(predictionList)
        .sortBy(({seconds}) => parseInt(seconds))
        .map('stopTag')
        .value();

      trip.nextStopTags = nextStopTags;
    });

    return {
      predictions: allStopPredictions,
      groups: groupedPredictions
    };
  },

  fetchVehicles: async (route) => {
    const params = {
      a: AGENCY,
      r: route
    };

    const result = await NextbusService.fetch({
      command: 'vehicleLocations',
      params: params
    });

    const vehicles = result.vehicle.map((v) => {
      return v.$;
    });

    return vehicles;
  },
};

module.exports = NextbusService;
