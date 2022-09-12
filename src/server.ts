import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';

const router = express();

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, { w : 'majority', retryWrites: true})
    .then(() => {console.log('connected')})
    .catch((error) => {console.log(error)});
