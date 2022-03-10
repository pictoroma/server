import { AuthenticationError } from 'apollo-server-express';
import { Ctx, Arg, Mutation, Resolver } from 'type-graphql';
import { Service } from 'typedi';
import { PushRegistrationModel } from '../models/push-registration';
import { PushRegistrationService } from '../services/push-registrations';
import { Context } from '../types/context';

@Resolver(() => PushRegistrationModel)
@Service()
class PushRegistrationResolver {
  #pushRegistrationService: PushRegistrationService;

  constructor(pushRegistrationService: PushRegistrationService) {
    this.#pushRegistrationService = pushRegistrationService;
  }

  @Mutation(() => PushRegistrationModel)
  public async registerPushNotification(
    @Arg('token', () => String) token: string,
    @Ctx() { user }: Context
  ) {
    if (!user) {
      throw new AuthenticationError('unauthorized');
    }
    const registartion = await this.#pushRegistrationService.update(token, user);
    return registartion;
  }
}

export { PushRegistrationResolver };
