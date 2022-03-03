import path from 'path';
import fs from 'fs-extra';
import crypto from 'crypto';
import winston from 'winston';

class Config {
  #jwtSecret?: string;
  #logger: winston.Logger;
  #configLogger: winston.Logger;

  constructor() {
    this.#logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      transports: [new winston.transports.Console()],
    });
    this.#configLogger = this.createLogger('core', 'config');
  }

  get emailFrom() {
    return process.env.EMAIL_FROM;
  }

  get smtp() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const username = process.env.SMTP_USERNAME;
    const password = process.env.SMTP_PASSWORD;

    if (!host) {
      return undefined;
    }

    return {
      host,
      port: port ? parseInt(port, 10) : undefined,
      username,
      password,
    };
  }

  get logger() {
    return this.#logger;
  }

  get dataLocation() {
    return process.env.DATA_LOCATION || path.resolve('.data');
  }

  get jwtSecret() {
    if (!this.#jwtSecret) {
      const secretLocation = path.join(this.dataLocation, 'jwt-secret');
      if (!fs.existsSync(secretLocation)) {
        this.#configLogger.info('creating JWT secret', {
          location: secretLocation,
        });
        fs.mkdirpSync(this.dataLocation);
        const secret = crypto.randomBytes(64).toString('hex');
        fs.writeFileSync(secretLocation, secret, 'utf-8');
        this.#configLogger.info('JWT secret created');
      }
      this.#configLogger.debug('reading JWT secret');
      this.#jwtSecret = fs.readFileSync(secretLocation, 'utf-8');
    }
    return this.#jwtSecret;
  }

  get imageLocation() {
    return path.join(this.dataLocation, 'images');
  }

  get adminPassword() {
    return process.env.ADMIN_PASSWORD;
  }

  get adminUsername() {
    return process.env.ADMIN_USERNAME || 'admin';
  }

  public createLogger = (type: string, name: string) => {
    return this.#logger.child({
      type,
      name,
    });
  };
}

export { Config };
