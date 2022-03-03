import { AuthenticationError } from 'apollo-server-express';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { UserModel } from '../models/user';
import { UserService } from '../services/users';
import { Context } from '../types/context';

@Resolver(UserModel)
@Service()
class UserResolver {
  #userService: UserService;

  constructor(userService: UserService) {
    this.#userService = userService;
  }

  @Query(() => UserModel, { nullable: true })
  public async profile(@Ctx() { user }: Context) {
    return user;
  }

  @Query(() => [UserModel])
  public async users() {
    const users = await this.#userService.find();
    return users;
  }

  @Mutation(() => String)
  public async createAuthToken(
    @Arg('username', () => String) username: string,
    @Arg('secret', () => String) secret: string
  ) {
    const token = await this.#userService.createAuthToken(username, secret);
    return token;
  }

  @Mutation(() => UserModel)
  public async setProfileAvatar(
    @Ctx() { user }: Context,
    @Arg('mediaId', () => String, { nullable: true }) mediaId?: string
  ) {
    if (!user) {
      throw new AuthenticationError('unauthorized');
    }
    const updatedUser = await this.#userService.setAvatar(mediaId, user);
    return updatedUser;
  }

  @Mutation(() => UserModel)
  public async inviteProfile(
    @Ctx() { user }: Context,
    @Arg('email', () => String) email: string
  ) {
    if (!user) {
      throw new AuthenticationError('unauthorized');
    }
    return this.#userService.invite(email, user);
  }
}

export { UserResolver };
