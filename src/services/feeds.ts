import { AuthenticationError } from 'apollo-server-express';
import { nanoid } from 'nanoid';
import { Service } from 'typedi';
import { Connection, IsNull, Repository } from 'typeorm';
import { FeedModel } from '../models/feed';
import { UserModel } from '../models/user';
import {
  UserFeedAccessType,
  UserFeedRelationModel,
} from '../models/user-feed-relation';
import { UserService } from './users';

@Service()
class FeedService {
  #userService: UserService;
  #feedRepo: Repository<FeedModel>;
  #userFeedRelationRepo: Repository<UserFeedRelationModel>;

  constructor(connection: Connection, userService: UserService) {
    this.#feedRepo = connection.getRepository(FeedModel);
    this.#userFeedRelationRepo = connection.getRepository(
      UserFeedRelationModel
    );
    this.#userService = userService;
  }

  public getFeedById = async (id: string, user: UserModel) => {
    const feed = await this.#feedRepo.findOne({
      id,
      removed: IsNull(),
    });
    if (!feed || !user.hasAccessToFeed(feed.id)) {
      return undefined;
    }
    return feed;
  };

  public getUsers = async (id: string, user: UserModel) => {
    const feed = await this.#feedRepo.findOne(
      { id },
      {
        relations: ['users', 'users.user'],
      }
    );
    if (!feed || feed.removed || !user.hasAccessToFeed(feed.id)) {
      throw new Error('Feed not found');
    }
    return feed.users;
  };

  public create = async (name: string, user: UserModel) => {
    const id = nanoid();
    if (!user.admin) {
      throw new Error('unautorized');
    }
    const feed = await this.#feedRepo.save({
      id,
      name,
    });
    await this.#userFeedRelationRepo.save({
      user,
      feed,
      accessType: UserFeedAccessType.Admin,
    });

    return this.#feedRepo.findOne({ id });
  };

  public list = async (user: UserModel) => {
    if (!user.admin) {
      throw new AuthenticationError('unauthorized');
    }
    const feeds = await this.#feedRepo.find({
      removed: IsNull(),
    });
    return feeds;
  }

  public addUserToFeed = async (
    feedId: string,
    userId: string,
    accessType: UserFeedAccessType,
    user: UserModel
  ) => {
    const targetUser = await this.#userService.getById(userId);
    const feed = await this.#feedRepo.findOne({ id: feedId });
    if (!targetUser) {
      throw new Error('could not find user');
    }
    if (
      !feed ||
      feed.removed ||
      !user.hasAccessToFeed(feed.id, [
        UserFeedAccessType.Admin,
        UserFeedAccessType.Moderator,
      ])
    ) {
      throw new Error('could not find feed');
    }
    return await this.#userFeedRelationRepo.save({
      user: targetUser,
      feed,
      accessType,
    });
  };

  public removeUserFromFeed = async (
    feedId: string,
    userId: string,
    user: UserModel
  ) => {
    const targetUser = await this.#userService.getById(userId);
    const feed = await this.#feedRepo.findOne({ id: feedId });
    if (!targetUser) {
      throw new Error('could not find user');
    }
    if (
      !feed ||
      feed.removed ||
      !user.hasAccessToFeed(feed.id, [
        UserFeedAccessType.Admin,
        UserFeedAccessType.Moderator,
      ])
    ) {
      throw new Error('could not find feed');
    }
    return await this.#userFeedRelationRepo.delete({
      user: targetUser,
      feed,
    });
  };

  public remove = async (feedId: string, user: UserModel) => {
    if (!user.admin) {
      throw new AuthenticationError('unauthorized');
    }
    const target = await this.getFeedById(feedId, user);
    if (!target) {
      throw new Error('feed not found');
    }
    target.removed = new Date();
    this.#feedRepo.save(target);
  }
}

export { FeedService };
