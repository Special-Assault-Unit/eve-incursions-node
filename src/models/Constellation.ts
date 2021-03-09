import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from 'typeorm';
import { ObjectType, Field, ID } from "type-graphql";
import {Spawn} from './Spawn';
import {System} from './System';

@Entity({
  name: 'mapconstellations'
})
@ObjectType()
export class Constellation extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn({name: 'constellationID'})
  id: string;

  @Field(() => String)
  @Column({name: 'constellationName'})
  name: string;

  @Field(() => [Spawn])
  @OneToMany(() => Spawn, spawn => spawn.constellation)
  spawns: Spawn[];

  @Field(() => [System])
  @OneToMany(() => System, s => s.constellation, {lazy: true})
  systems: System[];
}
