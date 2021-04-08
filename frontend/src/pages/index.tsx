import React from 'react';
import {GraphQLClient} from 'graphql-request';
import {ActiveSpawnsQuery, getSdk} from '../lib/graphql';
import {Spawn} from '../components/spawn/spawn';
import {LastHsSpawn} from '../components/spawn/lastHsSpawn';

export const getServerSideProps = async () => {
  const client = new GraphQLClient('http://server:4001');
  const sdk = getSdk(client);
  const {activeSpawns, lastHighSecSpawn} = await sdk.activeSpawns();

  return {props: {activeSpawns, lastHighSecSpawn}};
};


export default function Home({activeSpawns, lastHighSecSpawn: {date}}: ActiveSpawnsQuery) {
  return (
    <>
      <LastHsSpawn date={date} />
      <div className={'active-spawns'}>{
        activeSpawns.sort((s1, s2) => s2.stagingSystem.security - s1.stagingSystem.security).map((spawn) => {
          return (<Spawn key={spawn.id} spawn={spawn}/>);
        })
      }</div>
    </>
  );
}

