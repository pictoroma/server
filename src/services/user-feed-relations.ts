import { Service } from 'typedi';
import { Connection, Repository } from 'typeorm';
import { UserFeedRelationModel } from '../models/user-feed-relation';

@Service()
class UserFeedRelationService {
  #userFeedRelationRepo: Repository<UserFeedRelationModel>;

  constructor(connection: Connection) {
    this.#userFeedRelationRepo = connection.getRepository(
      UserFeedRelationModel
    );
  }

  public getUsers = (relation: UserFeedRelationModel) => {};
}

export { UserFeedRelationService };
