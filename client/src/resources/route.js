import axios from 'axios';

const SERVER_URL = 'http://192.168.86.88:3000';

const connect = () => {
  return axios.create({
    baseUrl: SERVER_URL
  });
}

export default {
  fetchSubroutes: () => {
    return connect().get(`${SERVER_URL}/subroutes`);
  }
}
