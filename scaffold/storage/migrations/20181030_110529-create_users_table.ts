import { container, StorageService } from "artoo";
import * as Promise from "bluebird";

const storageService: StorageService = container.getService(StorageService);

export let up: () => Promise<void> = () => {
    return new Promise<void>((resolve, reject) => {
        storageService.execute(`
          CREATE TABLE [users] (
            [id] INTEGER PRIMARY KEY,
            [email] VARCHAR(255),
            [password] VARCHAR(60),
            [created_at] DATETIME,
            [updated_at] DATETIME
          );
        `).then(() => resolve()).catch((error: Error) => reject(error));
    });
};

export let down: () => Promise<void> = () => {
    return new Promise<void>((resolve, reject) => {
        storageService.execute(`
          DROP TABLE IF EXISTS [users];
        `).then(() => resolve()).catch((error: Error) => reject(error));
    });
};
