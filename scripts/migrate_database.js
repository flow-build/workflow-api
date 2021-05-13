/* eslint-disable no-console */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const dotenv = require('dotenv');
const path = require('path');
const Knex = require('knex');

const config = require('../knexfile');

const knex = Knex(config[process.env.NODE_ENV]);

const setTimeoutAsync = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const runMigrations = async (retries, delay) => {
  for (let i = 1; i !== retries; i++) {
    try {
      await knex.migrate.rollback(undefined, true);
      return await knex.migrate.latest();
    } catch (err) {
      console.warn(err.message);
      await setTimeoutAsync(delay * i);
    }
  }

  throw new Error(`Unable to run migrations after ${retries} attempts.`);
};

const runSeeds = async (retries, delay) => {
  for (let i = 0; i !== retries; i++) {
    try {
      return await knex.seed.run();
    } catch (err) {
      console.warn(err.message);
      await setTimeoutAsync(delay * i);
    }
  }

  throw new Error(`Unable to run seeds after ${retries} attempts.`);
};

async function start() {
  try {
    await runMigrations(5, 2000);
    console.log('migration run sucessfully');
    await runSeeds(5, 2000);
    console.log('seeds run sucessfully');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

start();
