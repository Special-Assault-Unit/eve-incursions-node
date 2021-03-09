import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, PrimaryColumn} from 'typeorm';
import { ObjectType, Field, ID } from "type-graphql";
import {System} from './System';
import {Station} from './Station';

@Entity({
  name: 'sta_operation_services'
})
@ObjectType()
export class OperationService extends BaseEntity {
  @Field(() => Station)
  @ManyToOne(() => Station, station => station.operationServices)
  @JoinColumn({ name: "operationID", referencedColumnName: "operationID" })
  station: Station;

  @PrimaryColumn({name: "serviceID"})
  serviceId: number;

  @PrimaryColumn({name: "operationID"})
  operationId: number;
}
