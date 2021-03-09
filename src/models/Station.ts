import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, AfterLoad} from 'typeorm';
import { ObjectType, Field, ID } from "type-graphql";
import {System} from './System';
import {OperationService} from './OperationService';

@Entity({
  name: 'sta_stations'
})
@ObjectType()
export class Station extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({name: 'stationID'})
  id: string;

  @ManyToOne(() => System, system => system.stations)
  @JoinColumn({ name: "solarSystemID" })
  system: System;

  @OneToMany(() => OperationService, os => os.station, {eager: true, lazy: true})
  operationServices: OperationService[];

  @Column({name: 'operationID'})
  operationID: number;

  @Field(() => Boolean)
  hasRepairService: Promise<boolean>;

  @AfterLoad()
  private async setRepairStation() {
    this.hasRepairService = OperationService.count({where: {
        operationId: this.operationID,
        serviceId: 4096
      }}).then(v => v > 0);
  }
}
