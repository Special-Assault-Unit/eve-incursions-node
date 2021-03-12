import React from 'react';
import {GraphQLClient} from 'graphql-request';
import {ActiveSpawnsQuery, getSdk} from '../lib/graphql';
import {Spawn} from '../components/spawn/spawn';
import Link from 'next/link';
import {redisGet, redisSet} from '../lib/redis';

export const getServerSideProps = async () => {
  console.log(process.env)
  const cache = await redisGet('spawns');
  if (cache !== null && (!process.env.NODE_ENV || process.env.NODE_ENV !== 'development')) {
    return {props: {activeSpawns: JSON.parse(cache)}};
  } else {
    const client = new GraphQLClient('http://server:4001');
    const sdk = getSdk(client);
    const {activeSpawns} = await sdk.activeSpawns();

    await redisSet('spawns', JSON.stringify(activeSpawns));

    return {props: {activeSpawns}};
  }
};


export default function Home({activeSpawns}: ActiveSpawnsQuery) {
  return (
    <>
      <div className="alert alert-primary" role="alert">
        Sorry for the outage. Here is a small blog post on what happened: <Link href={'/blog'}>Post</Link>
      </div>
      <div className={'active-spawns'}>{
        activeSpawns.sort((s1, s2) => s2.stagingSystem.security - s1.stagingSystem.security).map((spawn) => {
          return (<Spawn key={spawn.id} spawn={spawn}/>);
        })
      }</div>
    </>
  );
}

