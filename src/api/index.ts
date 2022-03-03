import express from 'express';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ContainerInstance } from 'typedi';
import { MediaService } from '../services/media';
import { UserService } from '../services/users';

const asyncEndpoint = (fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  fn(req, res, next).catch(next);
}

const createApi = (container: ContainerInstance) => {
  const app = express();
  const mediaService = container.get(MediaService);
  const userService = container.get(UserService);

  app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
      callback(null, origin);
    },
    allowedHeaders: 'authorization,content-type',
  }));

  app.post('/authorize', bodyParser.json(), asyncEndpoint(async (req, res) => {
    const token = await userService.createAuthToken(
      req.body.username,
      req.body.secret,
    );
    res.json({
      token,
    });
  }));

  app.post('/accept-invitation', bodyParser.json(), asyncEndpoint(async (req, res) => {
    const { username, name, secret, creationToken } = req.body
    const user = await userService.acceptInvitation(
      creationToken,
      username,
      secret,
      name,
    );
    const token = await userService.createAuthToken(
      username,
      secret,
    )
    res.json({ token, user });
  }));

  app.use(async (req, res, next) => {
    const authorization = req.header('authorization');
    if (!authorization) {
      res.status(401);
      res.json({
        error: 'unauthenticated',
      })
      return;
    }
    const [,token] = authorization.split(' ');
    const user = await userService.getUserFromToken(token);
    req.user = user;
    next();
  });

  app.get('/config', (_, res) => {
    res.json({

    });
  });

  app.post('/media', fileUpload(), asyncEndpoint(async (req, res) => {
    const media = req.files?.media;
    if (!media) {
      throw new Error('Missing media');
    }
    const mediaList = Array.isArray(media) ? media : [media];
    const ids = await Promise.all(mediaList.map(async (item) => {
      const file = await mediaService.create(item, 0, req.user! as any);
      return file.id;
    }))
    res.json({
      ids,
    });
  }));

  app.get('/media/:id', asyncEndpoint(async (req, res) => {
    const id = req.params.id;
    const file = await mediaService.getMediaSteam(id);
    if (!file) {
      throw new Error('Could not get image');
    }
    file.pipe(res);
  }));

  app.get('/thumb/:id', async (req, res) => {
    const id = req.params.id;
    const { width, height } = req.query;
    const file = await mediaService.getThumb(id, {
      width: width ? parseInt(width as any) : undefined,
      height: height ? parseInt(height as any) : undefined,
    });
    file.pipe(res);
  });

  return app;
};

export { createApi };
