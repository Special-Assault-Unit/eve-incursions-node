import React, {ReactNode, useState} from 'react';
import Countdown from 'react-countdown';

export const LastHsSpawn = ({date: dateString} :{date: string | null}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const date = new Date(dateString ?? "");

  const handleComplete = () => {
    setNow(new Date());
  }

  if (dateString === null) return null;
  const diff = (now.getTime() - date.getTime());
  const _12hours = 12 * 60 * 60 * 1000;
  const _36hours = _12hours * 3;
  let text: ReactNode = "New HS spawn should be here any minute";
  if (diff < _12hours) text = <>No HS spawns possible in the next <Countdown key={'12'} date={date.getTime()  + _12hours} onComplete={handleComplete} daysInHours={true} /></>;
  else if (diff < _36hours) text = <>New HS spawn in the next <Countdown key={'36'} date={date.getTime()  + _36hours} onComplete={handleComplete} daysInHours={true} /></>

  return (<div className="alert alert-primary" role="alert">
    {text}
  </div>)
}
