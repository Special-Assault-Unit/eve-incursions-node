import React from 'react';
import {ActiveSpawnsQuery} from '../../lib/graphql';
import {Systems} from './systems';
import {Chart} from './chart';
import TimeAgo from 'react-timeago';

export const Spawn = ({spawn}: { spawn: ActiveSpawnsQuery['activeSpawns'][0] }) => {
  return (
    <div className="spawn">
      <h1 className="h3"><a
        href={`http://evemaps.dotlan.net/map/${spawn.constellation.region.name}/${spawn.constellation.name}#radius`}
        target="_blank">{spawn.constellation.name}</a></h1>
      <div className="information container">
        <div className="row">
          <div className="col-2">
            <img src={`https://images.evetech.net/${spawn.stagingSystem.sovereigntyHolderID < 600000 ? 'corporations' : 'alliances' }/${spawn.stagingSystem.sovereigntyHolderID}/logo?size=64`}
                 title={'sovholder'} alt={'sovholder'}/>
          </div>
          <div className="col-10">
            <dl className="row">
              <dt className="col-sm-6">Influence</dt>
              <dd className="col-sm-6">
                <div className="progress">
                  <div className="progress-bar" role="progressbar"
                       style={{width: Math.round(spawn.influence * 100) + '%'}}
                       aria-valuenow={spawn.influence * 100} aria-valuemin={0}
                       aria-valuemax={100}/>
                </div>
              </dd>

              <dt className="col-sm-6">State</dt>
              <dd className={`col-sm-6 state state-${spawn.state.toLocaleLowerCase()}`}>{spawn.state}
                {spawn.boss && " (Boss)"}
              </dd>

              <dt className="col-sm-6">Region</dt>
              <dd className="col-sm-6"><a href={`http://evemaps.dotlan.net/map/${spawn.constellation.region.name}`}
                                          target="_blank">{spawn.constellation.region.name}</a></dd>

              <dt className="col-sm-6">Stag. System</dt>
              <dd className="col-sm-6"><a href={`http://evemaps.dotlan.net/system/${spawn.stagingSystem.name}`}
                                          target="_blank">{spawn.stagingSystem.name}</a></dd>

              <dt className="col-sm-6">Sec. Status</dt>
              <dd className={`col-sm-6 sec sec-${spawn.stagingSystem.securityArea}`}>{spawn.stagingSystem.security}</dd>

              <dt className="col-sm-6">Started</dt>
              <dd className="col-sm-6">
                <TimeAgo date={spawn.establishedAt} />
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <Chart influenceLogArray={spawn.influenceLogArray} />
      <Systems systems={spawn.constellation.systems} />
    </div>
  );
}
