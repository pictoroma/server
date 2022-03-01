import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import * as tableNames from '../db/table-names';
import { UserFeedRelationModel } from './user-feed-relation';

@Entity({ name: tableNames.USERS })
@ObjectType()
class UserModel {
  @PrimaryColumn()
  @Field()
  public id!: string;

  @Column()
  @Field()
  public username!: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  public name?: string;

  @Column()
  @Field()
  public admin!: boolean;

  @Column({ nullable: true })
  public secret?: string;

  @Column({ nullable: true })
  public creationToken?: string;

  @Column({ name: 'avatar', nullable: true })
  @Field({ nullable: true })
  public avatar?: string;

  @OneToMany(
    () => UserFeedRelationModel,
    (relation) => relation.user,
  )
  @Field(() => [UserFeedRelationModel])
  public feeds!: UserFeedRelationModel[];
}

export { UserModel };
