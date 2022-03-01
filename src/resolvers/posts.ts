import { AuthenticationError } from "apollo-server-express";
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from "type-graphql";
import { Service } from "typedi";
import { MediaModel } from "../models/media";
import { PostModel } from "../models/post";
import { UserModel } from "../models/user";
import { PostCreateParameters, PostFindParameters, PostService } from "../services/posts";
import { Context } from "../types/context";

@Service()
@Resolver(PostModel)
class PostResolver {
  #postService: PostService;

  constructor(postService: PostService) {
    this.#postService = postService;
  }

  @Query(() => [PostModel])
  public async posts(
    @Arg('filter', () => PostFindParameters) filter: PostFindParameters = new PostFindParameters(),
    @Ctx() { user }: Context,
  ) {
    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }
    const posts = await this.#postService.find(
      filter,
      user,
    );
    return posts;
  }

  @FieldResolver(() => [UserModel])
  public async creator(
    @Root() root: PostModel
  ) {
    if (root.creator) {
      return root.creator;
    }
    return this.#postService.getCreator(root.id);
  }

  @FieldResolver(() => [MediaModel])
  public async media(
    @Root() root: PostModel
  ) {
    if (root.media) {
      return root.media;
    }
    return this.#postService.getMedia(root.id);
  }

  @Mutation(() => PostModel)
  public async createPost(
    @Arg('params', () => PostCreateParameters) params: PostCreateParameters,
    @Ctx() { user }: Context,
  ) {
    if (!user) {
      throw new AuthenticationError('Unauthorized');
    }
    const post = await this.#postService.create(
      params,
      user,
    );
    return post;
  }
}

export { PostResolver };
