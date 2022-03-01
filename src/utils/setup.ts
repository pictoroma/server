import { Connection } from "typeorm";
import bcrypt from 'bcrypt';
import { UserModel } from "../models/user";
import { ContainerInstance } from "typedi";
import { Config } from "../config";

const setupDB = async (container: ContainerInstance) => {
  const connection = container.get(Connection);
  const config = container.get(Config);
  const userRepo = connection.getRepository(UserModel);
  const currentAdmin = await userRepo.findOne({ id: 'admin' }) || {
    id: 'admin',
  } as Partial<UserModel>;

  currentAdmin.admin = true;
  if (config.adminPassword) {
    currentAdmin.secret = await bcrypt.hash(config.adminPassword, 10);
  } else if (!currentAdmin.secret) {
    currentAdmin.secret = await bcrypt.hash('admin', 10);
  }
  currentAdmin.username = config.adminUsername;
  await userRepo.save(currentAdmin);
}

export {
  setupDB,
};
