
import { Table, MigrationInterface, QueryRunner, TableForeignKey, TableIndex, TableColumn } from "typeorm";
import * as tableNames from '../table-names';

class AddPushRegistartion20200227205800 implements MigrationInterface {
  public up = async (runner: QueryRunner) => {
    await runner.createTable(new Table({
      name: tableNames.PUSH_REGISTRATIONS,
      columns: [
        { name: 'id', type: 'varchar', isPrimary: true },
        { name: 'user_id', type: 'varchar' },
        { name: 'device', type: 'varchar', isNullable: true },
        { name: 'token', type: 'varchar'}
      ],
    }));
    await runner.createIndex(tableNames.PUSH_REGISTRATIONS, new TableIndex({
      columnNames: ['user_id'],
    }));
    await runner.createForeignKey(tableNames.PUSH_REGISTRATIONS, new TableForeignKey({
      columnNames: ['user_id'],
      referencedColumnNames: ['id'],
      referencedTableName: tableNames.USERS,
    }));

  }

  public down = async () => {};
}

export { AddPushRegistartion20200227205800 };
