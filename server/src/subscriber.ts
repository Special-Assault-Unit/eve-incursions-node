import waitPort from 'wait-port';
import Redis from 'ioredis';
import {Spawn} from './models/Spawn';
import {createConnection} from './lib/db';
import fetch, {RequestInit} from 'node-fetch';

const stateMap = {
  "established": "has been established",
  "mobilizing": "has mobilized",
  "withdrawing": "is withdrawing",
  "ended": "has ended"
}

waitPort({host: process.env.MYSQL_HOST, port: 3306}).then(async () => {
  await createConnection();
  const redis = new Redis({host: 'redis'});

  await redis.subscribe("spawn.change");
  redis.on('message',async (channel, message) => {
    const {spawnId} = JSON.parse(message);
    const spawn = await Spawn.findOne(spawnId);

    if (!spawn) return;

    const stagingSystem = await spawn?.stagingSystem;
    const constellation = await stagingSystem?.constellation;
    const region = await constellation?.region;

    const state = stateMap[spawn?.state.toLocaleLowerCase() as keyof typeof stateMap];
    const string = `Incursion in **${stagingSystem?.name}** (Sec.: ${stagingSystem?.security} | Const.: ${constellation?.name} | Reg.: ${region?.name}) ${state}.`;
    const opts: RequestInit = {
      method: 'POST',
      body: JSON.stringify({content: string}),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const highSec = (stagingSystem?.security ?? 0) >= 0.5;

    //All
    await fetch('https://discord.com/api/webhooks/875850724691546222/0LRSrpq-VrpQ0V0EYyuiikpsHFcgqyGTLp_zSpBvtDYJKNmFGXRHXPT8xPzA_atc3PQm', opts);

    //Start only
    if (spawn.state.toLocaleLowerCase() === "established") {
      await fetch('https://discord.com/api/webhooks/882298366900453386/6cUkwhAM1_TsAtBwiwNBE5JNZ_CAeOzNj4MfdBT5nJ8nDOif4CGRlM_bTgXLoyfLEWxR', opts);

      //HS start only
      if (highSec) {
        await fetch('https://discord.com/api/webhooks/882299196475056158/hGwyQ4GuevUM-StT-iqu_z-JLWtplwxC2mbj05ryY33VqKhtCHAwRnOTbrAiENDi62sf', opts);
      }
    }

    //HS only
    if (highSec) {
      await fetch('https://discord.com/api/webhooks/882298846846287902/i7pZGDoCFT9inSYVvD4Yepra0u-1pkDuod2oWmmMvBnTUly6Cpeqq6n8-y2oF0Pb2GRm', opts);
    }

  });

}).catch(e => console.error(e));



