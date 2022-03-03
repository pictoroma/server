import { Service } from 'typedi';
import { Config } from '../config';
import nodemailer from 'nodemailer';
import winston from 'winston';

@Service()
class EmailService {
  #config: Config;
  #logger: winston.Logger;
  #tranporter?: nodemailer.Transporter;

  constructor(config: Config) {
    this.#config = config;
    this.#logger = config.createLogger('service', 'email');
    const smtp = config.smtp;
    if (!smtp) {
      return;
    }
    this.#tranporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: smtp.username
        ? {
            user: smtp.username,
            pass: smtp.password,
          }
        : undefined,
    });
  }

  public send = async (to: string, subject: string, body: string) => {
    const from = this.#config.emailFrom;
    if (!this.#tranporter) {
      this.#logger.warn('mail not send because no SMTP config', {
        to,
        subject,
        body,
        from,
      });
      return;
    }

    this.#logger.debug('sending email', {
      to,
      from,
      subject,
      body,
    });
    const info = await this.#tranporter.sendMail({
      from,
      to,
      subject,
      html: body,
    });

    return info;
  };
}

export { EmailService };
