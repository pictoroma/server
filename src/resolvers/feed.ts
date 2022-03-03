import { AuthenticationError } from 'apollo-server-express';
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Service } from 'typedi';
import { FeedModel } from '../models/feed';
import { PostModel } from '../models/post';
import {
  UserFeedAccessType,
  UserFeedRelationModel,
} from '../models/user-feed-relation';
import { FeedService } from '../services/feeds';
import { PostFindParameters, PostService } from '../services/posts';
import { Context } from '../types/context';

@Resolver(FeedModel)
@Service()
class FeedResolver {
  #feedService: FeedService;
  #postService: PostService;

  constructor(feedService: FeedService, postService: PostService) {
    this.#feedService = feedService;
    this.#postService = postService;
  }

  @Query(() => [FeedModel])
  public async feeds(@Ctx() { user }: Context) {
    if (!user) {
      throw new Error('Unauthroized');
    }
    return user.feeds.map(relation => relation.feed);
  }

  @Query(() => FeedModel)
  public async feed(
    @Arg('id', () => String) id: string,
    @Ctx() { user }: Context
  ) {
    if (!user) {
      throw new AuthenticationError('Unauthroized');
    }
    const feed = await this.#feedService.getFeedById(id, user);
    return feed;
  }

  @FieldResolver(() => [UserFeedRelationModel])
  public async users(@Root() root: FeedModel, @Ctx() { user }: Context) {
    if (!user) {
      return [];
    }
    if (root.users) {
      return root.users;
    }
    const users = await this.#feedService.getUsers(root.id, user);
    return users;
  }

  @FieldResolver(() => [PostModel])
  public async posts(
    @Root() root: FeedModel,
    @Arg('filter', () => PostFindParameters, { nullable: true })
    filter: PostFindParameters = new PostFindParameters(),
    @Ctx() { user }: Context
  ) {
    if (!user) {
      throw new AuthenticationError('Unauthroized');
    }
    filter.feeds = [root.id];
    const posts = await this.#postService.find(filter, user);
    return posts;
  }

  @Mutation(() => FeedModel)
  public async createFeed(@Arg('name') name: string, @Ctx() { user }: Context) {
    if (!user || !user.admin) {
      throw new Error('Unauthroized');
    }
    const feed = await this.#feedService.create(name, user);

    return feed;
  }

  @Mutation(() => UserFeedRelationModel)
  public async addUserToFeed(
    @Arg('feedId') feedId: string,
    @Arg('userId') userId: string,
    @Arg('accessType', () => String) accessType: UserFeedAccessType,
    @Ctx() { user }: Context
  ) {
    if (!user || !user.admin) {
      throw new Error('Unauthroized');
    }
    const relation = await this.#feedService.addUserToFeed(
      feedId,
      userId,
      accessType,
      user
    );

    return relation;
  }

  @Mutation(() => Boolean)
  public async removeUserFromFeed(
    @Arg('feedId') feedId: string,
    @Arg('userId') userId: string,
    @Ctx() { user }: Context
  ) {
    if (!user || !user.admin) {
      throw new Error('Unauthroized');
    }
    await this.#feedService.removeUserFromFeed(feedId, userId, user);

    return true;
  }
}

export { FeedResolver };
