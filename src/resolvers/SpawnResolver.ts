import {Resolver, Query} from 'type-graphql';
import {Spawn} from '../models/Spawn';

@Resolver()
export class SpawnResolver {
  @Query(() => [Spawn])
  spawns() {
    return Spawn.find({take: 10});
  }

  @Query(() => [Spawn])
  activeSpawns() {
    return Spawn.find({where: {active: true}});
  }
}
