import "reflect-metadata";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server";
import {buildSchema} from 'type-graphql';
import {SpawnResolver} from './resolvers/SpawnResolver';

async function main() {
  const connection = await createConnection()
  const schema = await buildSchema({
    resolvers: [SpawnResolver] // add this
  })
  const server = new ApolloServer({ schema })
  await server.listen(4001)
  console.log("Server has started!")
}

main().catch(e => console.error(e));
