import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
import * as tableNames from '../table-names';

class AddAvatar20200216205800 implements MigrationInterface {
  public up = async (runner: QueryRunner) => {
    await runner.addColumn(
      tableNames.USERS,
      new TableColumn({
        name: 'avatar',
        type: 'varchar',
        isNullable: true,
      })
    );
  };

  public down = async () => {};
}

export { AddAvatar20200216205800 };
