// Check if running on localhost, otherwise fall back to AWS domain
// const IS_LOCAL = window.location.hostname === 'localhost';

// export const API_BASE = {
//   // Locally, services run on different ports. 
//   // On AWS, they will sit behind a single load balancer via path-routing (/auth and /content)
//   USER: IS_LOCAL ? 'http://localhost:3001' : 'https://yourdomain.com',
//   CONTENT: IS_LOCAL ? 'http://localhost:3002' : 'https://yourdomain.com'
// };


const IS_LOCAL = window.location.hostname === 'localhost';

export const API_BASE = {
  // MUST include http:// so the browser doesn't append it as a relative sub-path
  USER: IS_LOCAL ? 'http://localhost:3001' : 'http://13.127.220.170',
  CONTENT: IS_LOCAL ? 'http://localhost:3002' : 'http://13.127.220.170'
  ,
  LAPTOP: IS_LOCAL ? 'http://localhost:3003' : 'http://13.127.220.170'
};
