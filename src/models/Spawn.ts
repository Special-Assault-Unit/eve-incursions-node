import {Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, AfterLoad} from 'typeorm';
import { ObjectType, Field, ID } from "type-graphql";
import {Constellation} from './Constellation';
import {System} from './System';

@Entity({
  name: 'spawns'
})
@ObjectType()
export class Spawn extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: string;

  @Field(() => String)
  @Column({})
  state: string;

  @Field(() => Boolean)
  @Column({})
  active: boolean;

  @Field(() => Constellation)
  @ManyToOne(() => Constellation, c => c.spawns, {lazy: true})
  constellation: Constellation;

  @Field(() => System)
  get stagingSystem() {
    return this.setStagingSystem();
  }

  private async setStagingSystem() {
    const constellation = await this.constellation;
    const systems = await constellation.systems;
    for (const system of systems ?? []) {
      if (system.type === "Staging") {
        return system;
      }
    }
  }
}
