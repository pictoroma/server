import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import * as tableNames from '../db/table-names';
import { UserModel } from './user';
import { FeedModel } from './feed';

enum UserFeedAccessType {
  Admin = 'admin',
  Moderator = 'moderator',
  Writer = 'writer',
  Reader = 'reader',
}

@Entity({ name: tableNames.USER_FEED_RELATIONS })
@ObjectType()
class UserFeedRelationModel {
  @ManyToOne(
    () => UserModel,
    (user) => user.id,
    { primary: true },
  )
  @JoinColumn({ name: 'user_id' })
  @Field(() => UserModel)
  public user!: UserModel;

  @ManyToOne(
    () => FeedModel,
    (feed) => feed.id,
    { primary: true },
  )
  @JoinColumn({ name: 'feed_id' })
  @Field(() => FeedModel)
  public feed!: FeedModel

  @Field()
  @Column({
    name: 'access_type',
    type: 'simple-enum',
    enum: UserFeedAccessType,
  })
  public accessType!: UserFeedAccessType;
}

export { UserFeedAccessType, UserFeedRelationModel };
