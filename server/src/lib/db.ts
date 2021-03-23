import {getConnectionManager} from 'typeorm';

export const createConnection = async () => {
  const connectionManager = getConnectionManager();

  if(!connectionManager.has("default")){
    connectionManager.create({
      "type": "mysql",
      "host": process.env.MYSQL_HOST,
      "username": process.env.MYSQL_USER,
      "database":  process.env.MYSQL_DB,
      "password":  process.env.MYSQL_PASSWORD,
      "entities": ["./src/models/*.ts"],

    });
  }

  const db = connectionManager.get();
  await db.connect();
  return db;
}
