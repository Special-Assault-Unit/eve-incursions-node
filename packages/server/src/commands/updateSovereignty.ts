import {System} from '../models/System';
import {AppDataSource} from '../lib/data-source';

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

  const res = await fetch('https://esi.evetech.net/latest/sovereignty/map', {
    headers: {
      'User-Agent': 'eve-incursions.de@lars.naurath@gmail.de'
    }
  });
  const sovSystems: APISovereignty[] = await res.json();
  const queryAlliances: number[] = [];

  await AppDataSource.manager.transaction(async manager => {
    for await (const sovSystem of sovSystems) {
      if (!sovSystem.alliance_id && !sovSystem.faction_id) continue;
      const sovId = sovSystem.alliance_id ?? sovSystem.faction_id;

      if (!queryAlliances.includes(sovId)) {
        queryAlliances.push(sovId);
      }

      const dbSystem = await System.findOneBy({id: sovSystem.system_id});
      if (!dbSystem) continue;

      if (sovId !== dbSystem.sovereigntyHolderID) {
        dbSystem.sovereigntyHolderID = sovId;

        await manager.save(dbSystem);
      }
    }

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
        await manager.createQueryBuilder().update(System).set({sovereigntyHolderName: name}).where({sovereigntyHolderID: id}).execute();
      }
    }
  });
};
