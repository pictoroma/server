import { AuthenticationError } from 'apollo-server-express';
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Service } from 'typedi';
import { CommentModel } from '../models/comment';
import { MediaModel } from '../models/media';
import { PostModel } from '../models/post';
import { UserModel } from '../models/user';
import { CommentService } from '../services/comments';
import {
  PostCreateParameters,
  PostFindParameters,
  PostService,
} from '../services/posts';
import { Context } from '../types/context';

@Service()
@Resolver(PostModel)
class PostResolver {
  #postService: PostService;
  #commentService: CommentService;

  constructor(postService: PostService, commentService: CommentService) {
    this.#commentService = commentService;
    this.#postService = postService;
  }

  @Query(() => [PostModel])
  public async posts(
    @Arg('filter', () => PostFindParameters)
    filter: PostFindParameters = new PostFindParameters(),
    @Ctx() { user }: Context
  ) {
    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }
    const posts = await this.#postService.find(filter, user);
    return posts;
  }

  @Query(() => PostModel)
  public async post(
    @Arg('id', () => String) id: string,
    @Ctx() { user }: Context
  ) {
    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }
    const post = await this.#postService.get(id, user);
    return post;
  }

  @FieldResolver(() => Number)
  public async commentCount(@Root() root: PostModel) {
    if (root.commentCount === 0 || root.commentCount > 0) {
      return root.commentCount;
    }
    return this.#commentService.getCommentCount(root);
  }

  @FieldResolver(() => [UserModel])
  public async creator(@Root() root: PostModel) {
    if (root.creator) {
      return root.creator;
    }
    return this.#postService.getCreator(root.id);
  }

  @FieldResolver(() => [CommentModel])
  public async comments(@Root() root: PostModel) {
    if (root.comments) {
      return root.comments;
    }
    return this.#postService.getComments(root.id);
  }

  @FieldResolver(() => [MediaModel])
  public async media(@Root() root: PostModel) {
    if (root.media) {
      return root.media;
    }
    return this.#postService.getMedia(root.id);
  }

  @Mutation(() => PostModel)
  public async createPost(
    @Arg('params', () => PostCreateParameters) params: PostCreateParameters,
    @Ctx() { user }: Context
  ) {
    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }
    const post = await this.#postService.create(params, user);
    return post;
  }
}

export { PostResolver };
