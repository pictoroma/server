import { Service } from 'typedi';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { InputType, Field } from 'type-graphql';
import { Connection, Repository } from 'typeorm';
import { Config } from '../config';
import { MediaModel } from '../models/media';
import { UserModel } from '../models/user';
import fileUpload from 'express-fileupload';

const writeFile = (input: Buffer, target: string) =>
  new Promise<void>((resolve, reject) => {
    const write = fs.createWriteStream(target);
    write.on('error', reject);
    write.write(input, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });

@InputType()
class ThumbParameters {
  @Field({ nullable: true })
  public width?: number;

  @Field({ nullable: true })
  public height?: number;
}

@Service()
class MediaService {
  #mediaRepo: Repository<MediaModel>;
  #config: Config;

  constructor(connection: Connection, config: Config) {
    this.#mediaRepo = connection.getRepository(MediaModel);
    this.#config = config;
  }

  public getById = async (id: string) => {
    const media = await this.#mediaRepo.findOne({ id });
    return media;
  };

  public getThumb = async (id: string, params: ThumbParameters) => {
    const location = path.join(this.#config.imageLocation, id);
    const thumbName = `x-${params.width || '_'}-y-${params.height || '_'}.jpeg`;
    const thumbLocation = path.join(location, 'thumbs', thumbName);
    if (!fs.existsSync(thumbLocation)) {
      const media = await this.getById(id);
      await fs.mkdirp(path.join(location, 'thumbs'));
      const originalLocation = path.join(
        location,
        media?.filename || 'original'
      );
      await sharp(originalLocation)
        .resize(params.width, params.height)
        .toFile(thumbLocation);
    }
    return fs.createReadStream(thumbLocation);
  };

  public remove = async (id: string, user: UserModel) => {
    await this.#mediaRepo.delete({ id });
    const location = path.join(this.#config.imageLocation, id);
    await fs.rmdir(location);
  };

  public getMediaSteam = async (id: string) => {
    const media = await this.getById(id);
    if (!media) {
      return undefined;
    }
    const filename = media.filename || 'original';
    const location = path.join(this.#config.imageLocation, id);
    const originalLocation = path.join(location, filename);
    return fs.createReadStream(originalLocation);
  };

  public create = async (
    file: fileUpload.UploadedFile,
    order: number | undefined,
    user: UserModel
  ) => {
    const id = nanoid();
    const location = path.join(this.#config.imageLocation, id);
    const originalLocation = path.join(location, file.name);
    await fs.mkdirp(location);
    await writeFile(file.data, originalLocation);
    const stats = await fs.stat(originalLocation);
    const image = sharp(originalLocation);
    const metadata = await image.metadata();
    const media = await this.#mediaRepo.save({
      id,
      contentType: file.mimetype,
      filename: file.name,
      creator: user,
      order,
      created: new Date(),
      size: stats.size,
      aspect: (metadata.width || 1) / (metadata.height || 1),
    });
    return media;
  };
}

export { MediaService };
