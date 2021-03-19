import React, {Fragment, ReactNode} from 'react';
import {GraphQLClient} from 'graphql-request';
import {ActiveCommunitiesQuery, getSdk, SpawnLogsQuery} from '../lib/graphql';
import {GetServerSideProps} from 'next';
import {log} from 'util';

export const getServerSideProps: GetServerSideProps = async ({query: {page = 1}}) => {
  const client = new GraphQLClient('http://server:4001');
  const sdk = getSdk(client);
  const {spawnLogs: {items, total}} = await sdk.spawnLogs({page: Number(page)});

  return {props: {spawnLogs: items, total}};
};

interface HistoryProps {
  spawnLogs: SpawnLogsQuery['spawnLogs']['items'];
  total: SpawnLogsQuery['spawnLogs']['total'];
}

export default function Home({spawnLogs, total}: HistoryProps) {

  let previousDate: string = '';
  return (
    <table style={{width: '100%'}} className="table">
      <thead>
      <tr>
        <th>Time</th>
        <th>Constellation</th>
        <th className="hidden-xs">Region</th>
        <th>Staging System</th>
        <th>State</th>
        <th/>
        <th className="hidden-xs">Sov. Holder</th>
      </tr>
      </thead>
      <tbody>
      {spawnLogs.map(logEntry => {
        const date = new Date(logEntry.date);
        const dateString = date.toLocaleDateString('en-DE', {weekday: 'short', year: 'numeric', month: 'numeric', day: 'numeric'});

        let dateNode: ReactNode;
        if (dateString !== previousDate) {
          dateNode = (
            <tr>
              <th colSpan={7}>{dateString}</th>
            </tr>
          );

          previousDate = dateString;
        }

        return (
          <Fragment key={dateString + logEntry.state + logEntry.spawn.stagingSystem.name}>
            {dateNode}
            <tr>
              <td>{date.toLocaleTimeString('de-DE', {timeStyle: 'short'})}</td>
              <td><a
                href={`http://evemaps.dotlan.net/map/${logEntry.spawn.constellation.region.name}/${logEntry.spawn.constellation.name}#radius`}
                target="_blank" rel="noopener">{logEntry.spawn.constellation.name}</a></td>
              <td className="hidden-xs"><a href={`http://evemaps.dotlan.net/map/${logEntry.spawn.constellation.region.name}`}
                                           target="_blank" rel="noopener">{logEntry.spawn.constellation.region.name}</a></td>
              <td><a href={`http://evemaps.dotlan.net/system/${logEntry.spawn.stagingSystem.name}`}
                     target="_blank" rel="noopener">{logEntry.spawn.stagingSystem.name}</a></td>
              <td className={`state state-${logEntry.state.toLocaleLowerCase()}`}>{logEntry.state}</td>
              <td>
                <img style={{width: '16px'}}
                     src={`https://images.evetech.net/${logEntry.spawn.stagingSystem.sovereigntyHolderID < 600000 ? 'corporations' : 'alliances'}/${logEntry.spawn.stagingSystem.sovereigntyHolderID}/logo?size=64`}
                     title={logEntry.spawn.stagingSystem.sovereigntyHolderName}
                     alt={logEntry.spawn.stagingSystem.sovereigntyHolderName}/>
              </td>
              <td className="hidden-xs">{logEntry.spawn.stagingSystem.sovereigntyHolderName}</td>
            </tr>
          </Fragment>
        );
      })}
      </tbody>
    </table>
  );
}

