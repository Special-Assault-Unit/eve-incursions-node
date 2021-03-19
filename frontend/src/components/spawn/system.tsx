import React, {MouseEventHandler, useState} from 'react';
import {ActiveSpawnsQuery} from '../../lib/graphql';
import {classNames} from '../../lib/utils';

export const System = ({system}: { system: ActiveSpawnsQuery['activeSpawns'][0]['constellation']['systems'][0] }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="system">
      <div className="row">
        <div className="col-1">
          {system.stations.length > 0 &&
          <span className="stations-toggle" onClick={() => setOpen(o => !o)}>
            {!open && "+"}{open && "-"}
            </span>
          }
        </div>
        <div className="col-4"><a href={`http://evemaps.dotlan.net/system/${system.name}`} target="_blank" rel="noopener">{system.name}</a></div>
        <div className={`col text-right sec sec-${system.securityArea}`}>{system.security}</div>
        <div className="col text-right">{system.size} AU</div>
      </div>
      <div className={classNames("stations", open && "open")}>
        {system.stations.map((station) => {
          return (
            <div className="station row" key={station.name}>
              <div className="col-1">
                {station.hasRepairService && <img src="/images/wrench.png" alt="Repair"/>}
              </div>
              <div className="col">
                {station.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
