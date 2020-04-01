/* globals DEVELOPMENT */

// Some tooling for fetch requests

// configure host
const development = DEVELOPMENT;
const secure = !development;
const wsProt = `ws${secure ? 's' : ''}`;
const webProt = `http${secure ? 's' : ''}`;
const server = development ? 'localhost:3000' : 'lifap5.univ-lyon1.fr';
const wsServer = `${wsProt}://${server}/stream/`;
const webServer = `${webProt}://${server}`;

// 7038e76c-7fc3-423f-bfaa-97a0872bdb68
const headers = (api) => {
  const h = new Headers();
  if (api) h.set('X-API-KEY', api);
  h.set('Accept', 'application/json');
  h.set('Content-Type', 'application/json');
  return h;
};

function filterHttpResponse(response) {
  return response.json().then((data) => {
    if (response.status >= 400 && response.status < 600) {
      throw new Error(`${data.name}: ${data.message}`);
    }
    return data;
  });
}

function debug(...args) {
  if (development) console.debug(...args);
}

export { wsServer, webServer, headers, filterHttpResponse, debug };
