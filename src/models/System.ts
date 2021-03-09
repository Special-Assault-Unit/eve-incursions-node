import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, AfterLoad, OneToMany, JoinColumn} from 'typeorm';
import { ObjectType, Field, ID } from "type-graphql";
import {Constellation} from './Constellation';
import {Station} from './Station';

@Entity({
  name: 'solar_systems'
})
@ObjectType()
export class System extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({name: 'solarSystemID'})
  id: string;

  @Field(() => String)
  @Column({name: 'solarSystemName'})
  name: string;

  @Field(() => Constellation)
  @ManyToOne(() => Constellation, c => c.systems, {lazy: true})
  constellation: Constellation;

  @Field(() => [Station])
  @OneToMany(() => Station, station => station.system, {lazy: true})
  stations: Station[];

  @Column({name: 'constellationID'})
  constellationId: number;

  @Field(() => String)
  @Column()
  sovereigntyHolderID: string;

  @Field(() => String)
  @Column()
  sovereigntyHolderName: string;

  @Field(() => Boolean)
  @Column()
  isIsland: boolean;

  @Field(() => Number)
  @Column({
    name: 'systemSize',
    transformer: {
      from: value => (value  + 17) * 2,
      to: value => value
    }
  })
  size: number;

  @Field(() => Number)
  @Column({
    transformer: {
      from: value => (value > 0) ? +parseFloat(value).toFixed(1) : +parseFloat(value).toFixed(2),
      to: value => value
    }
  })
  security: number;

  @Field(() => String)
  securityArea: 'null' | 'high' | 'low';

  @Field(() => String)
  @Column({name: 'systemType'})
  type: string;

  @Field(() => Boolean)
  hasRepairStation: boolean = false;

  @AfterLoad()
  private async setSecurityArea() {
    if (this.security <= 0) {
      this.securityArea = "null";
    } else if (this.security >= 0.5) {
      this.securityArea = "high";
    } else {
      this.securityArea = "low";
    }

    for (const s of this.stations) {
      console.log('t')
      if (await s.hasRepairService) {
        this.hasRepairStation = true;
        return;
      }
    }
  }
}
