import "reflect-metadata";
import {updateSpawns} from './commands/updateSpawns';
import {updateSovereignty} from './commands/updateSovereignty';
import {createConnection} from './lib/db';
import {updateRats} from './commands/updateRats';
import {calculateHSSpawn} from './commands/calculateHSSpawn';
import {redis} from './lib/redis';
import {updateSystems} from './commands/updateSystems';

const run = async () => {
  const connection = await createConnection();

  if (process.argv.length < 3) {
    console.log('Not enough parameters');
  }

  const args = process.argv.slice(3);
  const command = process.argv[2];

  if (command === "updateSpawns") {
    const influenceLogs = args.indexOf('--influenceLogs') !== -1;
    await updateSpawns(connection, influenceLogs);
  } else if (command === "updateSovereignty") {
    await updateSovereignty(connection);
  } else if (command === "updateRats") {
    await updateRats(connection);
  } else if (command === "calculateHSSpawn") {
    await calculateHSSpawn(connection);
  } else if (command === "updateSystems") {
    await updateSystems(connection);
  } else {
    console.log(`${command} not found`);
  }

  redis.disconnect();
  await connection.close();
};

run().catch(e => console.log(e));

