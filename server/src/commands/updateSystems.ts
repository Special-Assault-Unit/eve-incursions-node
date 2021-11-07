import {Connection} from 'typeorm';


/**
 * This needs a current mapSolarSystems table on the server to execute the mapRegions & mapConstellations tables should also be replaced manually
 * This does NOT add newly added systems or delete old ones. NO system size or island is recalculated
 *
 * @param connection
 */
export const updateSystems = async (connection: Connection) => {
  const rawSystems = await connection.query(`SELECT * FROM mapSolarSystems`);
  let differentCount = 0;

  for await (const rawSystem of rawSystems) {
    const rawId = rawSystem.solarSystemID;
    const systems = await connection.query(`SELECT * FROM solar_systems WHERE solarSystemID = ${rawId}`);

    if (systems.length === 0) {
      differentCount++;
    } else {
      const system = systems[0];
      const changedKeys = [];
      for (const rawSystemKey in rawSystem) {
        if (rawSystem[rawSystemKey] !== system[rawSystemKey]) {
          changedKeys.push(rawSystemKey);
        }
      }

      if (changedKeys.length > 0) {
        differentCount++;

        if (changedKeys.includes('constellationID')) {
          changedKeys.push('systemType');
          rawSystem.systemType = 'not known';
        }

        await connection.query(`UPDATE solar_systems SET ${changedKeys.map(key => `${key} = ?`).join(', ')} WHERE solarSystemID = ${rawId}`, changedKeys.map(key => rawSystem[key]));
      }
    }
  }
};
