import { storageInstance, Promise, PromiseResolve, PromiseReject } from 'artoo';

export let up: () => Promise<void> = () => {
    return new Promise<void>((resolve: PromiseResolve<void>, reject: PromiseReject) => {
        storageInstance.execute(`
          CREATE TABLE [groups] (
            [id] INTEGER PRIMARY KEY,
            [name] VARCHAR(255),
            [created_at] DATETIME,
            [updated_at] DATETIME
          );

          CREATE TABLE [users_to_groups] (
            [id] INTEGER PRIMARY KEY,
            [user_id] INT,
            [group_id] INT
          );
        `).then(() => resolve()).catch((error: Error) => reject(error));
    });
}

export let down: () => Promise<void> = () => {
    return new Promise<void>((resolve: PromiseResolve<void>, reject: PromiseReject) => {
        storageInstance.execute(`
          DROP TABLE IF EXISTS [groups];
          DROP TABLE IF EXISTS [users_to_groups];
        `).then(() => resolve()).catch((error: Error) => reject(error));
    });
}