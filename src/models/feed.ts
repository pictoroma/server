import { Entity, PrimaryColumn, OneToMany, Column } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import * as tableNames from '../db/table-names';
import { UserFeedRelationModel } from './user-feed-relation';
import { PostModel } from './post';

@Entity({ name: tableNames.FEEDS })
@ObjectType()
class FeedModel {
  @PrimaryColumn({ name: 'id' })
  @Field()
  public id!: string;

  @Column({ name: 'name' })
  @Field()
  public name!: string;

  @OneToMany(() => UserFeedRelationModel, relation => relation.feed)
  @Field(() => [UserFeedRelationModel])
  public users!: UserFeedRelationModel[];

  @OneToMany(() => PostModel, post => post.id)
  @Field(() => [PostModel])
  public posts!: PostModel;
}

export { FeedModel };
