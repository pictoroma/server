import { nanoid } from "nanoid";
import { Field, InputType } from "type-graphql";
import { Service } from "typedi";
import { Connection, Repository } from "typeorm";
import winston from "winston";
import { Config } from "../config";
import { CommentModel } from "../models/comment";
import { PostModel } from "../models/post";
import { UserModel } from "../models/user";
import { MediaService } from "./media";

@InputType()
class CommentCreateParameters {
  @Field({ nullable: true })
  public content?: string;

  @Field()
  public post!: string;
}

@Service()
class CommentService {
  #postRepo: Repository<PostModel>;
  #commentRepo: Repository<CommentModel>;
  #logger: winston.Logger;

  constructor(connection: Connection, config: Config, mediaService: MediaService) {
    this.#postRepo = connection.getRepository(PostModel);
    this.#commentRepo = connection.getRepository(CommentModel);
    this.#logger = config.createLogger('service', 'posts');
  }

  public create = async (params: CommentCreateParameters, user: UserModel) => {
    const id = nanoid();
    this.#logger.debug('creating comment', { id, params, user });
    const post = await this.#postRepo.findOne({ id: params.post });
    if (!post) {
      this.#logger.debug('post not found', params.post);
      throw new Error('post not found');
    }
    // TODO: Check feed access
    const comment = await this.#commentRepo.save({
      id,
      creator: user,
      created: new Date(),
      post,
      content: params.content,
    });

    this.#logger.debug('comment created', { id });
    return comment;
  }

  public getCommentCount = async (post: PostModel) => {
    const count = await this.#commentRepo.count({
      post,
    });
    return count;
  }

  public getCreator = async (id: string) => {
    const comment = await this.#commentRepo.findOne({ id }, {
      relations: [
        'creator',
      ],
    });
    if (!comment) {
      throw new Error('Comment not found');
    }
    return comment.creator;
  }
}

export { CommentCreateParameters, CommentService };
