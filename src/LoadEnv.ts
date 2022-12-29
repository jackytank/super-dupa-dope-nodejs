import dotenv from 'dotenv';
import commandLineArgs from 'command-line-args';
import logger from './winston';
import path from 'path';

logger.info(`NODE_ENV: ${process.env.NODE_ENV || ''}`);

if (process.env.NODE_ENV) {
    // Set the env file
    const result = dotenv.config({
        path: path.join(__dirname, `../env/${process.env.NODE_ENV}.env`),
    });
    console.log(path.join(__dirname, `../env/${process.env.NODE_ENV}.env`));

    if (result.error) {
        throw result.error;
    }
} else {
    // Setup command line options
    const options = commandLineArgs([
        {
            name: 'env',
            alias: 'e',
            defaultValue: 'local',
            type: String,
        },
    ]);
    // Set the env file
    const result = dotenv.config({
        path: path.join(__dirname, `../env/${process.env.NODE_ENV}.env`),
    });

    if (result.error) {
        throw result.error;
    }
}
