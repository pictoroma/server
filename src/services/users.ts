import { Service } from 'typedi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Connection, IsNull, Not, Repository } from 'typeorm';
import { UserModel } from '../models/user';
import { Config } from '../config';
import { nanoid } from 'nanoid';
import { EmailService } from './emails';
import { AuthenticationError } from 'apollo-server-express';

type Session = {
  userId: string;
};

@Service()
class UserService {
  #config: Config;
  #userRepo: Repository<UserModel>;
  #emailService: EmailService;

  constructor(
    connection: Connection,
    config: Config,
    emailService: EmailService
  ) {
    this.#userRepo = connection.getRepository(UserModel);
    this.#config = config;
    this.#emailService = emailService;
  }

  public getUserFromToken = async (token: string) => {
    const tokenData = jwt.verify(token, this.#config.jwtSecret) as Session;
    const user = this.#userRepo.findOne(
      {
        id: tokenData.userId,
        removed: IsNull(),
      },
      {
        relations: ['feeds', 'feeds.feed'],
      }
    );
    return user;
  };

  public getById = async (id: string) => {
    const user = await this.#userRepo.findOne({
      id,
      removed: IsNull(),
    });
    return user;
  };

  public find = async () => {
    const users = await this.#userRepo.find({
      removed: IsNull(),
    });
    return users;
  };

  public setAvatar = async (mediaId: string | undefined, user: UserModel) => {
    const userCopy = await this.getById(user.id);
    userCopy!.avatar = mediaId || (null as any);
    const updatedUser = await this.#userRepo.save(userCopy!);
    return updatedUser;
  };

  public createAuthToken = async (username: string, secret: string) => {
    const user = await this.#userRepo.findOne({
      username,
      removed: IsNull(),
    });
    if (!user || !user.secret) {
      throw new Error('Invalid');
    }
    if (!(await bcrypt.compare(secret, user.secret))) {
      throw new Error('Invalid');
    }
    const session: Session = {
      userId: user.id,
    };
    const token = jwt.sign(session, this.#config.jwtSecret, {
      algorithm: 'HS512',
    });

    return token;
  };

  public invite = async (email: string, user: UserModel) => {
    if (!user.admin) {
      throw new Error('unauthorized');
    }
    const invitedUser = new UserModel();
    invitedUser.id = nanoid();
    invitedUser.username = email;
    invitedUser.admin = false;
    invitedUser.creationToken = nanoid();
    const senderName = user.name || user.username;
    const inviteCode = Buffer.from(JSON.stringify({
      domain: this.#config.url,
      creationToken: invitedUser.creationToken,
    })).toString('base64');
    const link = `pictoroma://AcceptInvitation?inviteCode=${inviteCode}`;
    await this.#emailService.send(
      email,
      `${senderName} has invited you to join pictoroma`,
      `
  <h1>You have been invited!</h1>

  <p>${senderName} has invited you to their Pictoroma server at ${this.#config.url}</p>
  <p>
  To accept the invitation start by installing the pictoroma app for <a href="https://apps.apple.com/us/app/pictoroma/id1610213341">iOS</a> or <a href="https://play.google.com/store/apps/details?id=pro.mortenolsen.olli">Android</a>
  </p>

  <p>
      Click <a href="${link}">this link</a> or copy paste ${link} into you phones browser to accept the invitation.
  </p>
  <p>
    Pick your username and password and you are in!
  </p>`


    );
    return this.#userRepo.save(invitedUser);
  };

  public acceptInvitation = async (
    creationToken: string,
    username: string,
    secret: string,
    name?: string
  ) => {
    const invitedUser = await this.#userRepo.findOne({
      creationToken,
      removed: IsNull(),
    });
    if (!invitedUser) {
      throw new Error('Invitation does not exist');
    }
    invitedUser.creationToken = null as any;
    invitedUser.username = username;
    invitedUser.name = name;
    invitedUser.secret = await bcrypt.hash(secret, 10);
    return this.#userRepo.save(invitedUser);
  };

  public remove = async (userId: string, user: UserModel) => {
    if (!user.admin) {
      throw new AuthenticationError('unauthorized');
    }
    const target = await this.getById(userId);
    if (!target) {
      throw new Error('user not found');
    }
    target.removed = new Date();
    this.#userRepo.save(target);
  }
}

export { UserService };
