const cors = require('cors');

const corsOptions = {
    origin: ['http://localhost:3000', 'https://minimal-nest.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'PATH', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);