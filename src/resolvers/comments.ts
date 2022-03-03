import { AuthenticationError } from 'apollo-server-express';
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Resolver,
  Root,
} from 'type-graphql';
import { Service } from 'typedi';
import { CommentModel } from '../models/comment';
import { UserModel } from '../models/user';
import { CommentCreateParameters, CommentService } from '../services/comments';
import { Context } from '../types/context';

@Service()
@Resolver(CommentModel)
class CommentResolver {
  #commentService: CommentService;

  constructor(commentService: CommentService) {
    this.#commentService = commentService;
  }

  @FieldResolver(() => UserModel)
  public async creator(@Root() root: CommentModel) {
    if (root.creator) {
      return root.creator;
    }

    const creator = await this.#commentService.getCreator(root.id);
    return creator;
  }

  @Mutation(() => CommentModel)
  public async createComment(
    @Arg('params', () => CommentCreateParameters)
    params: CommentCreateParameters,
    @Ctx() { user }: Context
  ) {
    if (!user) {
      throw new AuthenticationError('unautorized');
    }
    const comment = await this.#commentService.create(params, user);
    return comment;
  }
}

export { CommentResolver };
