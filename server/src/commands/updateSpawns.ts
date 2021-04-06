import {createConnection} from '../lib/db';
import fetch from 'node-fetch';
import {Spawn} from '../models/Spawn';
import {System} from '../models/System';
import {SpawnLog} from '../models/SpawnLog';
import {capitalize} from '../lib/utils';
import {InfluenceLogEntry} from '../models/InfluenceLogEntry';
import {Connection, In, Not} from 'typeorm';
import {redisDel} from '../lib/redis';

interface APISpawns {
  constellation_id: number;
  faction_id: number;
  has_boss: boolean;
  infested_solar_systems: number[];
  influence: number;
  staging_solar_system_id: number;
  state: string;
  type: string

}

export const updateSpawns = async (connection: Connection, doInfluenceLogs = false) => {
  const res = await fetch('https://esi.evetech.net/latest/incursions', {
    headers: {
      'User-Agent': 'eve-incursions.de@lars.naurath@gmail.de'
    }
  });
  const spawns: APISpawns[] = await res.json();

  let changed = false;

  await connection.manager.transaction(async manager => {
    const updatedSpawns = [];

    for await (const spawn of spawns) {
      let dbSpawn = await Spawn.findOne({where: {constellationId: spawn.constellation_id, active: true}});

      if (dbSpawn === undefined) {
        dbSpawn = new Spawn();
        dbSpawn.constellationId = spawn.constellation_id;
        dbSpawn.active = true;
        dbSpawn.type = 0;
        dbSpawn.establishedAt = new Date();

        let stagingSystem = await System.findOne({where: {constellation: spawn.constellation_id, type: 'Staging'}});

        if (!stagingSystem || stagingSystem.id !== spawn.staging_solar_system_id) {
          const newStagingSystem = await System.findOne(spawn.staging_solar_system_id);
          if (!newStagingSystem) return;

          newStagingSystem.type = 'Staging';
          await manager.save(newStagingSystem);

          if (stagingSystem) {
            stagingSystem.type = 'not known';
            await manager.save(stagingSystem);
          }

          stagingSystem = newStagingSystem;
        }
      }

      const oldState = dbSpawn.state ?? '';
      dbSpawn.influence = spawn.influence;
      dbSpawn.boss = spawn.has_boss;
      dbSpawn.state = capitalize(spawn.state);

      await manager.save(dbSpawn);

      updatedSpawns.push(dbSpawn.id);

      if (oldState.toLocaleLowerCase() !== spawn.state.toLocaleLowerCase()) {
        const spawnLog = new SpawnLog();
        spawnLog.spawn = dbSpawn as any;
        spawnLog.date = new Date();
        spawnLog.state = capitalize(spawn.state);
        await manager.save(spawnLog);
        changed = true;
      }

      if (doInfluenceLogs) {
        const influenceLog = new InfluenceLogEntry();
        influenceLog.influence = spawn.influence;
        influenceLog.spawn = dbSpawn as any;
        influenceLog.date = new Date();
        await manager.save(influenceLog);
        changed = true;
      }
    }

    const endedSpawns = await Spawn.find({where: {active: true, id: Not(In(updatedSpawns))}});

    for (const endedSpawn of endedSpawns) {
      changed = true;
      endedSpawn.state = 'Ended';
      endedSpawn.active = false;
      endedSpawn.endedAt = new Date();
      await manager.save(endedSpawn);

      const endedSpawnLog = new SpawnLog();
      endedSpawnLog.state = 'Ended';
      endedSpawnLog.date = new Date();
      endedSpawnLog.spawn = endedSpawn as any;
      await manager.save(endedSpawnLog);
    }

  });

  if (changed) redisDel('spawns');
};
