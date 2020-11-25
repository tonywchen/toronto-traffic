const xml2js = require('xml2js');

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

const baseUrl = 'http://webservices.nextbus.com/service/publicXMLFeed?';

const Nextbus = () => {
  this.agency = 'ttc';

  const _getCurrentTimestamp = () => {
    return new Date().getTime();
  };

  const _buildQueryString = ({ command, params = {} }) => {
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

  this.fetch = async ({ command, params = {} }) => {
    const queryString = _buildQueryString({ command, params });
    const requestUrl = baseUrl + queryString;

    try {
      const response = await axios.get(requestUrl);
      const jsonData = await xml2js.parseStringPromise(response.data);

      console.log(`Request: ${requestUrl} - ${response.headers['request-duration']}`);

      return jsonData.body;
    } catch (e) {
      throw e;
    }
  };

  this.fetchRoute = async (route) => {
    const params = {
      a: this.agency,
      r: route
    };

    const result = await this.fetch({
      command: 'routeConfig',
      params: params
    });

    const stops = result.route[0].stop.map(s => s.$);

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
  };

  this.fetchPredictions = async (route, directionTag, stops) => {
    if (!stops) {
      return null;
    };

    const currentTimestamp = _getCurrentTimestamp();

    const compoundStops = stops.map((stop) => {
      return `${route}|${directionTag}|${stop.tag}`;
    });

    const params = {
      a: this.agency,
      stops: compoundStops
    };

    const result = await this.fetch({
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
        isDeparture: prediction.isDeparture
      };

      return acc;
    }, {});

    /* const tripMap = {};
    result.predictions.forEach((stop) => {
      if (!stop.direction) {
        return;
      }

      stop.direction.forEach((direction) => {
        direction.prediction.forEach((prediction) => {
          const vehicle = prediction.$.vehicle;
          const tripTag = prediction.$.tripTag;
          const identifier = `${vehicle}-${tripTag}`;

          const stopPrediction = {
            ...prediction.$,
            routeTag: stop.$.routeTag,
            routeTitle: stop.$.routeTitle,
            stopTag: stop.$.stopTag,
            stopTitle: stop.$.stopTitle,
            createdAt: currentTimestamp
          };

          tripMap[identifier] = tripMap[identifier] || [];
          tripMap[identifier].push(stopPrediction);
        });
      });
    });

    const tripMap2 = {};
    result.predictions.forEach((stop) => {
      if (!stop.direction) {
        return;
      }

      stop.direction.forEach((direction) => {
        direction.prediction.forEach((prediction) => {
          const tripTag = prediction.$.tripTag;
          const directionTag = prediction.$.dirTag;
          const stopTag = stop.$.stopTag;

          tripMap2[tripTag] = tripMap2[tripTag] || {
            tripTag: tripTag,
            directionMap: {}
          };
          tripMap2[tripTag].directionMap[directionTag] = tripMap2[tripTag].directionMap[directionTag] || {
            directionTag: directionTag,
            stopMap: {}
          };
          tripMap2[tripTag].directionMap[directionTag].stopMap[stopTag] = {
            tripTag: tripTag,
            directionTag: directionTag,
            stopTag: stopTag,
            routeTag: stop.$.routeTag,
            routeTitle: stop.$.routeTitle,
            timestamp: currentTimestamp,
            seconds: prediction.$.seconds,
            isDeparture: prediction.$.isDeparture,
            vehicle: prediction.$.vehicle,
            block: prediction.$.block
          }
        });
      });
    }); */

    return {
      predictions: allStopPredictions,
      // tripMap: tripMap,
      // tripMap2: tripMap2,
      groups: groupedPredictions
    };
  };

  this.fetchVehicleLocation = async (route, timestamp) => {
    timestamp = timestamp || (new Date().getTime() - 60 * 1000);
    const params = {
      a: this.agency,
      r: route,
      t: timestamp
    };

    const result = await this.fetch({
      command: 'vehicleLocations',
      params: params
    });

    const lastTime = result.lastTime[0].$.time;
    const vehicles = result.vehicle.map((v) => {
      return {
        ...v.$,
        lastTime
      };
    });

    return vehicles;
  };

  return this;
};

module.exports = Nextbus;
