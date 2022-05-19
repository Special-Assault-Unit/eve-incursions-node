import React from 'react';
import {GraphQLClient} from 'graphql-request';
import {getSdk, RatGroupsQuery} from '../lib/graphql';
import {Rat} from '../components/rats/Rat';

export const getStaticProps = async () => {
  const client = new GraphQLClient('http://server:4001');
  const sdk = getSdk(client);
  const {ratGroups} = await sdk.ratGroups();

  return {props: {ratGroups}};
};


export default function Rats({ratGroups}: RatGroupsQuery) {
  return (
    <>
      <h1>Sansha Rats</h1>
      {ratGroups.map(({name, rats}) => {
        rats.sort((r1, r2) => r1.name.localeCompare(r2.name));
        return (
          <div key={name}>
            <h2>{name}</h2>
            {rats.map(rat => <Rat key={rat.name} rat={rat}/>)}
          </div>
        );
      })}
    </>
  );
}
