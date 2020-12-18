import axios from 'axios';

const SERVER_URL = 'http://192.168.86.88:3000';

const connect = () => {
  return axios.create({
    baseUrl: SERVER_URL
  });
}

const routes = {
  fetchSubroutes: () => {
    return connect().get(`${SERVER_URL}/subroutes`);
  }
};

export default routes;
