import {createClient} from 'redis';
import {promisify} from 'util';

export const redisClient = createClient({
  host: 'redis'
});

export const redisGet = promisify(redisClient.get).bind(redisClient);
export const redisSet = promisify(redisClient.set).bind(redisClient);
