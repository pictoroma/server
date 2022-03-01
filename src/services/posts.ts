import { nanoid } from "nanoid";
import { Field, InputType } from "type-graphql";
import { Service } from "typedi";
import { Connection, Repository } from "typeorm";
import winston from "winston";
import { Config } from "../config";
import { FeedModel } from "../models/feed";
import { MediaModel } from "../models/media";
import { PostModel } from "../models/post";
import { UserModel } from "../models/user";

@InputType()
class PostFindParameters {
  @Field({ nullable: true })
  offset?: number;

  @Field({ nullable: true })
  limit?: number;

  @Field(() => [String], { nullable: true })
  feeds?: string[];

  @Field({ nullable: true })
  after?: Date;
}

@InputType()
class PostCreateParameters {
  @Field({ nullable: true })
  public body?: string;

  @Field(() => [String])
  public media!: string[];

  @Field()
  public feed!: string;
}

@Service()
class PostService {
  #postRepo: Repository<PostModel>;
  #mediaRepo: Repository<MediaModel>;
  #feedRepo: Repository<FeedModel>;
  #logger: winston.Logger;

  constructor(connection: Connection, config: Config) {
    this.#postRepo = connection.getRepository(PostModel);
    this.#mediaRepo = connection.getRepository(MediaModel);
    this.#feedRepo = connection.getRepository(FeedModel);
    this.#logger = config.createLogger('service', 'posts');
  }

  public create = async (params: PostCreateParameters, user: UserModel) => {
    const id = nanoid();
    this.#logger.debug('creating post', { id, params, user });
    const media = await this.#mediaRepo.findByIds(params.media);
    const feed = await this.#feedRepo.findOne({ id: params.feed });
    if (!feed) {
      this.#logger.debug('feed not found', params.feed);
      throw new Error('Feed not found');
    }
    // TODO: Check feed access
    const post = await this.#postRepo.save({
      id,
      creator: user,
      created: new Date(),
      body: params.body,
      feed,
      media,
    });

    this.#logger.debug('post created', { id });
    return post;
  }

  public getMedia = async (id: string) => {
    this.#logger.debug('getting media', { id })
    const post = await this.#postRepo.findOne({ id }, {
      relations: ['media'],
    });
    if (!post) {
      return [];
    }
    return post.media;
  }

  public getCreator = async (id: string) => {
    this.#logger.debug('getting creator', { id })
    const post = await this.#postRepo.findOne({ id }, {
      relations: ['creator'],
    });
    if (!post) {
      return undefined;
    }
    return post.creator;
  }

  public find = async (filter: PostFindParameters, user: UserModel) => {
    this.#logger.debug('searching', { filter, user })
    if (filter.feeds && filter.feeds.find(f => !user.feeds.find(u => u.feed.id === f))) {
      throw new Error('Unauthroized');
    }
    let query = this.#postRepo.createQueryBuilder('post');
    if (filter.offset) {
      query = query.offset(filter.offset);
    }
    if (filter.limit) {
      query = query.limit(filter.limit);
    }
    if (filter.feeds) {
      query = query.where('post.feed IN (:...feeds)', {
        feeds: filter.feeds,
      });
    } else {
      query = query.where('post.feed IN (:...feeds)', {
        feeds: user.feeds.map(f => f.feed.id),
      });
    }
    query = query.orderBy('post.created_at', 'DESC');
    return query.getMany();
  }
}

export { PostCreateParameters, PostFindParameters, PostService };