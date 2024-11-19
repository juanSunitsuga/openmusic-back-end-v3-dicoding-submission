const SongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'songs',
    version: '1.0.0',
    register: async (server, { SongsService, SongsValidator }) => {
        const songsHandler = new SongsHandler(SongsService, SongsValidator);
        server.route(routes(songsHandler));
    },
};
