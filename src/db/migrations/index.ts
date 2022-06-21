import { MigrationInterface } from 'typeorm';
import { Init20200214205800 } from './init';
import { AddAvatar20200216205800 } from './add-avatar';
import { AddPushRegistartion20200227205800 } from './add-push-registration';
import { UpdateMedia20200303205800 } from './update-media';
import { AddMeta20200310205800 } from './add-meta';
import { AddPostRemoved20200310205900 } from './add-post-removed';

const migrations: (new () => MigrationInterface)[] = [
  Init20200214205800,
  AddAvatar20200216205800,
  AddPushRegistartion20200227205800,
  UpdateMedia20200303205800,
  AddMeta20200310205800,
  AddPostRemoved20200310205900,
];

export { migrations };
