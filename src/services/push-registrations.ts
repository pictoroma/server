import { Service } from 'typedi';
import { Connection, Repository } from 'typeorm';
import winston from 'winston';
import { Config } from '../config';
import { PushRegistrationModel } from '../models/push-registration';
import { UserModel } from '../models/user';
import { Expo, ExpoPushTicket } from 'expo-server-sdk';
import { UserFeedRelationService } from './user-feed-relations';
import { FeedService } from './feeds';

@Service()
class PushRegistrationService {
  #pushRegistrationRepo: Repository<PushRegistrationModel>;
  #userFeedRelationService: UserFeedRelationService;
  #feedService: FeedService;
  #logger: winston.Logger;
  #config: Config;
  #expo?: Expo;

  constructor(connection: Connection, config: Config, userFeedRelationService: UserFeedRelationService, feedService: FeedService) {
    this.#feedService = feedService;
    this.#userFeedRelationService = userFeedRelationService;
    this.#pushRegistrationRepo = connection.getRepository(PushRegistrationModel);
    this.#logger = config.createLogger('service', 'posts');
    this.#config = config;
    if (config.expoAccessToken) {
      this.#expo = new Expo({
        accessToken: config.expoAccessToken,
      })
    }
  }

  public update = async (token: string, user: UserModel) => {
    this.#logger.debug('creating push registration', { token, user });
    const model = await this.#pushRegistrationRepo.save({
      id: token,
      token,
      user,
    });
    return model;
  }


  // https://github.com/expo/expo-server-sdk-node
  public sendToFeed = async (feedId: string, message: string, user: UserModel) => {
    if (!this.#expo) {
      return;
    }
    const feed = await this.#feedService.getFeedById(feedId, user);
    if (!feed) {
      throw new Error('feed not found');
    }
    let users = await this.#userFeedRelationService.getUsersForFeed(feed);
    // users = users.filter(u => u.id !== user.id);
    const pushRegistrations = await this.#pushRegistrationRepo.createQueryBuilder('push')
      .where('push.user IN (:...users)', { users: users.map(u => u.id) }).getMany();

    const messages = pushRegistrations.map((push) => ({
      to: push.token,
      sound: 'default' as any,
      body: message,
    }))

    let chunks = this.#expo.chunkPushNotifications(messages);
    let tickets = [];
    for (let chunk of chunks) {
      try {
        let ticketChunk = await this.#expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }
    const withError = tickets.filter((ticket: any) => ticket.details?.error);
    if (withError.length > 0) {
      console.log('errors', withError);
    }
  }
}

export { PushRegistrationService };
