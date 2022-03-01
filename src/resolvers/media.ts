import { FileUpload, GraphQLUpload } from "graphql-upload";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { MediaModel } from "../models/media";
import { MediaService } from "../services/media";
import { Context } from "../types/context";
import { AuthenticationError } from "apollo-server-express";
import { Service } from "typedi";

@Service()
@Resolver(MediaModel)
class MediaResolver {
  #mediaService: MediaService;

  constructor(mediaService: MediaService) {
    this.#mediaService = mediaService;
  }
}

export { MediaResolver };
