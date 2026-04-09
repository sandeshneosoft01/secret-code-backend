import express from 'express';
import dotenv from 'dotenv';
import initializeApp from './app';

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 5000);

initializeApp(app);
