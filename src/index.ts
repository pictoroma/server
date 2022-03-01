import path from 'path';
import fs from 'fs-extra';
import { ContainerInstance } from 'typedi';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createConnection, Connection } from 'typeorm';
import { buildSchema } from 'type-graphql';
import { setupDB } from './utils/setup';
import { createApi } from './api';
import { migrations } from './db/migrations';
import { UserResolver } from './resolvers/users';
import { UserModel } from './models/user';
import { FeedModel } from './models/feed';
import { UserFeedRelationModel } from './models/user-feed-relation';
import { PostModel } from './models/post';
import { MediaModel } from './models/media';
import { Config } from './config';
import { UserService } from './services/users';
import { FeedResolver } from './resolvers/feed';
import { UserFeedRelationResolver } from './resolvers/user-feed-relation-resolver';
import { PostResolver } from './resolvers/posts';
import { MediaResolver } from './resolvers/media';
import { PushRegistrationModel } from './models/push-registration';
import { PushRegistrationResolver } from './resolvers/push-registration';

const start = async () => {
  const container = new ContainerInstance('main');
  container.set(Config, new Config());

  const config = container.get(Config);
  const logger = config.createLogger('core', 'startup');

  logger.debug('ensure data directory exists', {
    location: config.dataLocation,
  })
  await fs.mkdirp(config.dataLocation);

  logger.debug('create db connection');
  const connection = await createConnection({
    type: 'sqlite',
    database: path.join(config.dataLocation, 'data.sqlite'),
    migrations,
    migrationsTableName: 'migrations',
    entities: [
      UserModel,
      FeedModel,
      UserFeedRelationModel,
      PostModel,
      MediaModel,
      PushRegistrationModel,
    ],
  });

  logger.debug('running database migrations');
  await connection.query('PRAGMA foreign_keys=OFF');
  await connection.runMigrations();
  await connection.query('PRAGMA foreign_keys=ON');
  container.set(Connection, connection);

  logger.debug('bootstrapping database');
  await setupDB(container);

  logger.debug('building GraphQL schema');
  const schema = await buildSchema({
    resolvers: [
      UserResolver,
      FeedResolver,
      UserFeedRelationResolver,
      PostResolver,
      MediaResolver,
      PushRegistrationResolver,
    ],
    container,
  })

  logger.debug('creating GraphQL server');
  const server = new ApolloServer({
    schema,
    introspection: true,
    context: async ({ req }) => {
      const authorization = req.header('authorization');
      if (authorization) {
        const [,token] = authorization.split(' ');
        const userService = container.get(UserService);
        const user = await userService.getUserFromToken(token);
        return { user, req };
      }
      return { req }
    }
  });
  await server.start();

  const app = express();
  logger.debug('creating api');
  app.use('/api', createApi(container));

  server.applyMiddleware({ app });

  logger.debug('starting server');
  await new Promise<void>(r => app.listen({ port: 4000 }, r));

  logger.info('server has started');
}

start().catch(console.error);
