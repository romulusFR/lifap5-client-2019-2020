// Some tooling for fetch requests

// const server = 'https://lifap5.univ-lyon1.fr';

const secure = false;
const wsProt = `ws${secure ? 's' : ''}`;
const webProt = `http${secure ? 's' : ''}`;

const server = 'localhost:3000';
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
  return console.debug(...args)
}

export { wsServer, webServer, headers, filterHttpResponse, debug };
