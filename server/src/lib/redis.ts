import {createClient} from 'redis';
import {promisify} from 'util';

export const redisClient = createClient({
  host: 'redis'
});

export const redisDel: (key: string | string[]) => Promise<number> = promisify(redisClient.del).bind(redisClient);
