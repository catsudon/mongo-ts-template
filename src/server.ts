import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';

const router = express();

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, { w: 'majority', retryWrites: true })
    .then(() => {
        Logging.info('Connected to MongoDB');
        startServer();
    })
    .catch((error) => {
        Logging.error('Unable to connect: ');
        Logging.error(error);
    });

/** Only start the server if Mongo Connects */
const startServer = () => {
    router.use((req, res, next) => {
        /** Log the Request */
        Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log the Response */
            Logging.info(`Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);
        });
    });

    router.use(express.urlencoded({ extended: true}));
    router.use(express.json());

    /** Rules of API */
    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-Width, Content-Type, Accept, Authorization');

        if(req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }

        next();
    });

    /** Routes */

    /** Healthcheck */
    router.get('/ping', (req, res, next) => res.status(200).json({ message: 'pong'}));

    /** Error Handling */
    router.use((req, res, next) => {
        const error = new Error('not found');
        Logging.error(error);

        return res.status(404).json({ message: error.message});
    })

    http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on port ${config.server.port}`))
};
