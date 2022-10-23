import React from 'react';
import {GraphQLClient} from 'graphql-request';
import {ActiveCommunitiesQuery, getSdk} from '../lib/graphql';

export const getServerSideProps = async () => {
  const client = new GraphQLClient('http://server:4001');
  const sdk = getSdk(client);
  const {activeCommunities} = await sdk.activeCommunities();

  return {props: {activeCommunities}};
};


export default function Home({activeCommunities}: ActiveCommunitiesQuery) {
  return (
    <div className={'communities'}>
      <h1>Incursion Communities</h1>
      <table style={{width: '100%'}} className="table">
        <thead>
        <tr>
          <th style={{width: '16px'}}>VG</th>
          <th style={{width: '16px'}}>AS</th>
          <th style={{width: '16px'}}>HQ</th>
          <th className="hidden-xs">Tag</th>
          <th>Name</th>
          <th style={{textAlign: 'center'}} className="hidden-xs">Timezone</th>
          <th style={{textAlign: 'center'}}>Language</th>
          <th style={{textAlign: 'center'}}>Tank</th>
          <th>Channel</th>
        </tr>
        </thead>
        <tbody>
        {activeCommunities.map((community) => {
          const languages = community.language.split(',');
          const tanks = community.tank.split(',');

          return (
            <tr key={community.name}>
              <td>
                {community.vg && <img src={'/images/tick.png'} alt="VG"/>}
              </td>
              <td>
                {community.as && <img src={'/images/tick.png'} alt="AS"/>}
              </td>
              <td>
                {community.hq && <img src={'/images/tick.png'} alt="HQ"/>}
              </td>
              <td className="hidden-xs">{community.tag}</td>
              <td>{community.name}</td>
              <td style={{textAlign: 'center'}} className="hidden-xs">{community.timezone}</td>
              <td style={{textAlign: 'center'}}>{languages.map(language => <img key={language} src={`/images/languages/${language}.png`} alt={language}
                                                                                title={language}/>)}</td>
              <td style={{textAlign: 'center'}}>{tanks.map(tank => <img key={tank} src={`/images/${tank}.png`} alt={tank} title={tank}/>)}</td>
              <td>{community.channel}</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
}

