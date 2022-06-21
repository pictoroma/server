import {
  Entity,
  Column,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field } from 'type-graphql';
import * as tableNames from '../db/table-names';
import { PostModel } from './post';
import { UserModel } from './user';

enum MediaType {
  VIDEO = 'video',
  IMAGE = 'image',
}

@Entity({ name: tableNames.MEDIA })
@ObjectType()
class MediaModel {
  @PrimaryColumn({ name: 'id' })
  @Field()
  public id!: string;

  @Column({ name: 'content_type', nullable: true })
  @Field({ nullable: true })
  public contentType!: string;

  @Column({ name: 'size' })
  @Field()
  public size!: number;

  @Column({ name: 'removed', nullable: true })
  @Field({ nullable: true })
  public removed?: Date;

  @ManyToOne(() => UserModel)
  @JoinColumn({ name: 'creator_id' })
  @Field(() => UserModel)
  public creator!: UserModel;

  @Column({ name: 'lowres', nullable: true })
  @Field({ nullable: true })
  public lowres!: string;

  @Column({ name: 'aspect', nullable: true })
  @Field({ nullable: true })
  public aspect?: number;

  @Column({ name: 'filename', nullable: true })
  @Field({ nullable: true })
  public filename?: string;

  @Column({ name: 'order', nullable: true })
  @Field({ nullable: true })
  public order?: number;

  @Column({ name: 'created_at', nullable: true })
  @Field({ nullable: true })
  public created?: Date;

  @Column({
    name: 'type',
    type: 'simple-enum',
    enum: MediaType,
    nullable: true,
  })
  @Field({ nullable: true })
  public type: MediaType = MediaType.IMAGE;

  @ManyToMany(() => PostModel)
  @JoinTable({
    name: tableNames.POST_MEDIA_RELATIONS,
    joinColumn: {
      name: 'media_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'post_id',
      referencedColumnName: 'id',
    },
  })
  public posts!: PostModel[];
}

export { MediaModel };
