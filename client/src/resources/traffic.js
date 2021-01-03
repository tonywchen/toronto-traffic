import axios from 'axios';
import moment from 'moment-timezone';

import { SERVER_URL } from '../config';

const connect = () => {
  return axios.create({
    baseUrl: SERVER_URL
  });
}

const traffic = {
  fetchTraffic: (from) => {
    const adjustedStartDate = moment(from).startOf('day').format();
    const adjustedEndDate = moment(from).endOf('day').format();
    const params = {
      startDate: adjustedStartDate,
      endDate: adjustedEndDate
    };

    return connect().get(`${SERVER_URL}/traffic`, {
      params
    });
  },
  fetchPaths: () => {
    return connect().get(`${SERVER_URL}/paths`);
  }
};

export default traffic;
