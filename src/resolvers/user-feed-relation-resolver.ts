import { FieldResolver, Resolver, Root } from "type-graphql";
import { Service } from "typedi";
import { UserModel } from "../models/user";
import { UserFeedRelationModel } from "../models/user-feed-relation";

@Service()
@Resolver(UserFeedRelationModel)
class UserFeedRelationResolver {
  @FieldResolver(() => UserModel)
  public async user(
    @Root() root: UserFeedRelationModel,
  ) {
    if (root.user) {
      return root.user;
    }
  }
}

export { UserFeedRelationResolver };
