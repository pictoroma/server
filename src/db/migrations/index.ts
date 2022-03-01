import { MigrationInterface } from 'typeorm';
import { Init20200214205800 } from './init';
import { AddAvatar20200216205800 } from './add-avatar';
import { AddPushRegistartion20200227205800 } from './add-push-registration';

const migrations: (new () => MigrationInterface)[] = [
  Init20200214205800,
  AddAvatar20200216205800,
  AddPushRegistartion20200227205800,
];

export {
  migrations,
};
