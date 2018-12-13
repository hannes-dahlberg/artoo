import { container, StorageService } from "artoo";
import * as Promise from "bluebird";

const storageService: StorageService = container.getService(StorageService);

export let up: () => Promise<void> = () => {
  return new Promise<void>((resolve, reject) => {
    storageService.execute(`
          CREATE TABLE [claims] (
            [id] INTEGER PRIMARY KEY,
            [name] VARCHAR(255)
          );

          CREATE TABLE [users_to_claims] (
            [id] INTEGER PRIMARY KEY,
            [user_id] INT,
            [claim_id] INT
          );

          CREATE TABLE [groups_to_claims] (
            [id] INTEGER PRIMARY KEY,
            [group_id] INT,
            [claim_id] INT
          )
        `).then(() => resolve()).catch((error: Error) => reject(error));
  });
};

export let down: () => Promise<void> = () => {
  return new Promise<void>((resolve, reject) => {
    storageService.execute(`
          DROP TABLE IF EXISTS [claims];
          DROP TABLE IF EXISTS [users_to_claims];
          DROP TABLE IF EXISTS [groups_to_claims];
        `).then(() => resolve()).catch((error: Error) => reject(error));
  });
};
