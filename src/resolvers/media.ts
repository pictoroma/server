import { Resolver } from 'type-graphql';
import { MediaModel } from '../models/media';
import { Service } from 'typedi';

@Service()
@Resolver(MediaModel)
class MediaResolver {}

export { MediaResolver };
