import { Service } from 'typedi';
import { Connection, Repository } from 'typeorm';
import { FeedModel } from '../models/feed';
import { UserFeedRelationModel } from '../models/user-feed-relation';

@Service()
class UserFeedRelationService {
  #userFeedRelationRepo: Repository<UserFeedRelationModel>;

  constructor(connection: Connection) {
    this.#userFeedRelationRepo = connection.getRepository(
      UserFeedRelationModel
    );
  }

  public getUsersForFeed = async (feed: FeedModel) => {
    const relations = await this.#userFeedRelationRepo.find({
      where: { feed },
      relations: ['user'],
    });
    return relations.map(r => r.user);
  };
}

export { UserFeedRelationService };
