import { Service } from 'typedi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Connection, Repository } from 'typeorm';
import { UserModel } from '../models/user';
import { Config } from '../config';
import { nanoid } from 'nanoid';
import { EmailService } from './emails';

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
      { id: tokenData.userId },
      {
        relations: ['feeds', 'feeds.feed'],
      }
    );
    return user;
  };

  public getById = async (id: string) => {
    const user = await this.#userRepo.findOne({ id });
    return user;
  };

  public find = async () => {
    const users = await this.#userRepo.find();
    return users;
  };

  public setAvatar = async (mediaId: string | undefined, user: UserModel) => {
    const userCopy = await this.getById(user.id);
    userCopy!.avatar = mediaId || (null as any);
    const updatedUser = await this.#userRepo.save(userCopy!);
    return updatedUser;
  };

  public createAuthToken = async (username: string, secret: string) => {
    const user = await this.#userRepo.findOne({ username });
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
    const link = `pictoroma://AcceptInvitation?inviteCode=${invitedUser.creationToken}`;
    await this.#emailService.send(
      email,
      'Invitation',
      `Install Pictoroma and click <a href="${link}">here</a> or copy paste ${link}`
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
}

export { UserService };
