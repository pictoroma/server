import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import * as tableNames from '../db/table-names';
import { UserModel } from './user';
import { PostModel } from './post';

@Entity({ name: tableNames.COMMENTS })
@ObjectType()
class CommentModel {
  @PrimaryColumn({
    name: 'id',
  })
  @Field()
  public id!: string;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'creator_id' })
  @Field(() => UserModel)
  public creator!: UserModel;

  @ManyToOne(() => PostModel)
  @JoinColumn({ name: 'post_id' })
  @Field(() => PostModel)
  public post!: PostModel;

  @Column({ name: 'created_at' })
  @Field()
  public created!: Date;

  @Column({ name: 'content' })
  @Field()
  public content!: string;

  @Column({ name: 'removed', nullable: true })
  @Field({ nullable: true })
  public removed?: Date;
}

export { CommentModel };
