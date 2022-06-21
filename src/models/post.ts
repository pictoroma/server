import {
  JoinTable,
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import * as tableNames from '../db/table-names';
import { UserModel } from './user';
import { MediaModel } from './media';
import { FeedModel } from './feed';
import { CommentModel } from './comment';

@Entity({ name: tableNames.POSTS })
@ObjectType()
class PostModel {
  @PrimaryColumn({ name: 'id' })
  @Field()
  public id!: string;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'creator_id' })
  @Field(() => UserModel, { nullable: true })
  public creator!: UserModel;

  @ManyToOne(() => FeedModel)
  @JoinColumn({ name: 'feed_id' })
  @Field(() => FeedModel)
  public feed!: FeedModel;

  @Column({ name: 'removed', nullable: true })
  @Field({ nullable: true })
  public removed?: Date;

  @Column({ name: 'created_at' })
  @Field()
  public created!: Date;

  @Column({ name: 'body', nullable: true })
  @Field({ nullable: true })
  public body?: string;

  @Field()
  public commentCount!: number;

  @OneToMany(() => CommentModel, comment => comment.post)
  @Field(() => [CommentModel])
  public comments!: CommentModel[];

  @ManyToMany(() => MediaModel)
  @JoinTable({
    name: 'post_media_relations',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'media_id',
      referencedColumnName: 'id',
    },
  })
  @Field(() => [MediaModel])
  public media!: MediaModel[];
}

export { PostModel };
