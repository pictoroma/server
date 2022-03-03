import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserModel } from './user';
import * as tableNames from '../db/table-names';

@Entity({ name: tableNames.PUSH_REGISTRATIONS })
@ObjectType()
class PushRegistrationModel {
  @PrimaryColumn({ name: 'id' })
  @Field()
  public id!: string;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'user_id' })
  public user!: UserModel;

  @Field({ nullable: true })
  @Column({ name: 'device', nullable: true })
  public device?: string;

  @Column({ name: 'token' })
  public token!: string;
}

export { PushRegistrationModel };
