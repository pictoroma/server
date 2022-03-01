import { nanoid } from "nanoid";
import { Service } from "typedi";
import { Connection, Repository } from "typeorm";
import { FeedModel } from "../models/feed";
import { UserModel } from "../models/user";
import { UserFeedAccessType, UserFeedRelationModel } from "../models/user-feed-relation";
import { UserService } from "./users";

@Service()
class FeedService {
  #userService: UserService;
  #feedRepo: Repository<FeedModel>;
  #userFeedRelationRepo: Repository<UserFeedRelationModel>;

  constructor(
    connection: Connection,
    userService: UserService,
  ) {
    this.#feedRepo = connection.getRepository(FeedModel);
    this.#userFeedRelationRepo = connection.getRepository(UserFeedRelationModel);
    this.#userService = userService;
  }

  public getFeedById = async (id: string) => {
    const feed = await this.#feedRepo.findOne({ id });
    return feed;
  }

  public getUsers = async (id: string) => {
    const feed = await this.#feedRepo.findOne({ id }, {
      relations: [
        'users',
        'users.user',
      ],
    });
    if (!feed) {
      throw new Error('Feed not found');
    }
    return feed.users;
  }

  public create = async (name: string, user: UserModel) => {
    const id = nanoid();
    const feed = await this.#feedRepo.save({
      id,
      name,
    });
    await this.#userFeedRelationRepo.save({
      user,
      feed,
      accessType: UserFeedAccessType.Admin,
    });

    return this.#feedRepo.findOne({ id })
  }

  public addUserToFeed = async (feedId: string, userId: string, accessType: UserFeedAccessType) => {
    const user = await this.#userService.getById(userId);
    const feed = await this.#feedRepo.findOne({ id: feedId });
    if (!user) {
      throw new Error('could not find user');
    } 
    if (!feed) {
      throw new Error('could not find feed');
    }
    return await this.#userFeedRelationRepo.save({
      user,
      feed,
      accessType,
    })
  }

  public removeUserFromFeed = async (feedId: string, userId: string) => {
    const user = await this.#userService.getById(userId);
    const feed = await this.#feedRepo.findOne({ id: feedId });
    if (!user) {
      throw new Error('could not find user');
    } 
    if (!feed) {
      throw new Error('could not find feed');
    }
    return await this.#userFeedRelationRepo.delete({
      user,
      feed,
    })
  }
}

export { FeedService };
