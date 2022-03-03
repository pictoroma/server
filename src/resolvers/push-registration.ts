import { AuthenticationError } from 'apollo-server-express';
import { nanoid } from 'nanoid';
import { Ctx, Arg, Mutation, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { PushRegistrationModel } from '../models/push-registration';
import { Context } from '../types/context';

@Resolver(() => PushRegistrationModel)
@Service()
class PushRegistrationResolver {
  @Mutation(() => PushRegistrationModel)
  public async registerPushNotification(
    @Arg('token', () => String) token: string,
    @Ctx() { user }: Context
  ) {
    if (!user) {
      throw new AuthenticationError('unauthorized');
    }
    const registartion = new PushRegistrationModel();
    registartion.id = nanoid();
    registartion.user = user;
    registartion.token = token;
    return registartion;
  }
}

export { PushRegistrationResolver };
