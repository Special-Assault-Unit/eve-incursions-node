import {createConnection} from '../lib/db';
import fetch from 'node-fetch';
import {System} from '../models/System';

interface APISovereignty {
  system_id: number;
  corporation_id: number;
  alliance_id: number;
  faction_id: number;
}

interface APINames {
  category: string;
  id: number;
  name: string;
}

export const updateSovereignty = async () => {
  const connection = await createConnection();

  const res = await fetch('https://esi.evetech.net/latest/sovereignty/map', {
    headers: {
      'User-Agent': 'eve-incursions.de@lars.naurath@gmail.de'
    }
  });
  const sovSystems: APISovereignty[] = await res.json();
  const queryAlliances: number[] = [];

  try {
    await connection.manager.transaction(async manager => {
      for await (const sovSystem of sovSystems) {
        if (!sovSystem.alliance_id && !sovSystem.faction_id) continue;
        const dbSystem = await System.findOne(sovSystem.system_id);

        if (!dbSystem) continue;

        const sovId = sovSystem.alliance_id ?? sovSystem.faction_id;

        if (sovId !== dbSystem.sovereigntyHolderID) {
          dbSystem.sovereigntyHolderID = sovId;

          await manager.save(dbSystem);

          if (!queryAlliances.includes(sovId)) {
            queryAlliances.push(sovId);
          }
        }
      }

      if (queryAlliances.length === 0) return;

      for (let i = 0; i <= queryAlliances.length; i += 1000) {
        const nameRes = await fetch('https://esi.evetech.net/latest/universe/names', {
          headers: {
            'User-Agent': 'eve-incursions.de@lars.naurath@gmail.de',
          },
          method: 'post',
          body: JSON.stringify(queryAlliances.slice(i, i + 1000))
        });

        const names: APINames[] = await nameRes.json();

        for await (const {name, id} of names) {
          await manager.createQueryBuilder().update(System).set({sovereigntyHolderName: name}).where({sovereigntyHolderID: id});
        }
      }
    });
  } catch (e) {
    console.error(e);
    await connection.close();
    return;
  }

  await connection.close();
};
