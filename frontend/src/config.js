// Check if running on localhost, otherwise fall back to AWS domain
// const IS_LOCAL = window.location.hostname === 'localhost';

// export const API_BASE = {
//   // Locally, services run on different ports. 
//   // On AWS, they will sit behind a single load balancer via path-routing (/auth and /content)
//   USER: IS_LOCAL ? 'http://localhost:3001' : 'https://yourdomain.com',
//   CONTENT: IS_LOCAL ? 'http://localhost:3002' : 'https://yourdomain.com'
// };


const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '::1'];
const IS_LOCAL = LOCAL_HOSTNAMES.includes(window.location.hostname);

export const API_BASE = {
  USER: IS_LOCAL ? 'http://localhost:5002' : 'http://http://13.239.134.203/:5002',
  CONTENT: IS_LOCAL ? 'http://localhost:5001' : 'http://http://13.239.134.203/:5001',
};
