import React from 'react';
import {ActiveSpawnsQuery} from '../../lib/graphql';
import {Systems} from './systems';
import {Chart} from './chart';
import TimeAgo from 'react-timeago';
import Countdown from 'react-countdown';
import {dotlanTransform} from '../../lib/utils';

export const Spawn = ({spawn}: { spawn: ActiveSpawnsQuery['activeSpawns'][0] }) => {
  let lifetime = 24 * 60 * 60 * 1000;
  if (spawn.state === 'Mobilizing') {
    lifetime *= 3;
  } else if (spawn.state === 'Established') {
    lifetime *= 8;
  }
  const maxLifetimeDate = new Date(spawn.lastStateChangeDate).getTime() + lifetime;

  return (
    <div className="spawn">
      <h1 className="h3"><a
        href={`https://evemaps.dotlan.net/map/${dotlanTransform(spawn.constellation.region.name)}/${dotlanTransform(spawn.constellation.name)}#radius`}
        target="_blank" rel="noopener">{spawn.constellation.name}</a></h1>
      <div className="information container">
        <div className="row">
          <div className="col-2">
            <img
              src={`https://images.evetech.net/${spawn.stagingSystem.sovereigntyHolderID < 600000 ? 'corporations' : 'alliances'}/${spawn.stagingSystem.sovereigntyHolderID}/logo?size=64`}
              title={spawn.stagingSystem.sovereigntyHolderName} alt={spawn.stagingSystem.sovereigntyHolderName}/>
          </div>
          <div className="col-10">
            <dl className="row">
              <dt className="col-sm-6">Influence</dt>
              <dd className="col-sm-6">
                <div className="progress">
                  <div className="progress-bar" role="progressbar" aria-label={'Influence'}
                       style={{width: Math.round(spawn.influence * 100) + '%'}}
                       aria-valuenow={spawn.influence * 100} aria-valuemin={0}
                       aria-valuemax={100}/>
                </div>
              </dd>

              <dt className="col-sm-6">State</dt>
              <dd className={`col-sm-6 state state-${spawn.state.toLocaleLowerCase()}`}>{spawn.state}
                {spawn.boss && ' (Boss)'}
              </dd>

              <dt className="col-sm-6">Region</dt>
              <dd className="col-sm-6"><a href={`https://evemaps.dotlan.net/map/${dotlanTransform(spawn.constellation.region.name)}`}
                                          target="_blank" rel="noopener">{spawn.constellation.region.name}</a></dd>

              <dt className="col-sm-6">Stag. System</dt>
              <dd className="col-sm-6"><a href={`https://evemaps.dotlan.net/system/${dotlanTransform(spawn.stagingSystem.name)}`}
                                          target="_blank" rel="noopener">{spawn.stagingSystem.name}</a></dd>

              <dt className="col-sm-6">Sec. Status</dt>
              <dd className={`col-sm-6 sec sec-${spawn.stagingSystem.securityArea}`}>{spawn.stagingSystem.security}</dd>

              <dt className="col-sm-6">Started</dt>
              <dd className="col-sm-6">
                <TimeAgo date={spawn.establishedAt}/>
              </dd>


              <>
                <dt className="col-sm-6" title={'This is the maximum possible time the incursion will stay active'}>Max. remaining</dt>
                <dd className="col-sm-6">
                  <Countdown intervalDelay={spawn.state === 'Established' ? 100000 : 1000} daysInHours={true} renderer={({
                                                                                                                           days: rawDays,
                                                                                                                           formatted: {minutes, hours, seconds}
                                                                                                                         }) => spawn.state === 'Established' ? `up to ${rawDays} days` : `${hours}:${minutes}:${seconds}`}
                             date={maxLifetimeDate}/>
                </dd>
              </>
            </dl>
          </div>
        </div>
      </div>
      <Chart influenceLogArray={spawn.influenceLogArray}/>
      <Systems systems={spawn.constellation.systems}/>
    </div>
  );
};
