import { storageInstance, Promise, PromiseResolve, PromiseReject } from 'artoo';

export let up: () => Promise<void> = () => {
    return new Promise<void>((resolve: PromiseResolve<void>, reject: PromiseReject) => {
        storageInstance.execute(`
          CREATE TABLE [users] (
            [id] INTEGER PRIMARY KEY,
            [email] VARCHAR(255),
            [password] VARCHAR(60),
            [created_at] DATETIME,
            [updated_at] DATETIME
          );
        `).then(() => resolve()).catch((error: Error) => reject(error));
    });
}

export let down: () => Promise<void> = () => {
    return new Promise<void>((resolve: PromiseResolve<void>, reject: PromiseReject) => {
        storageInstance.execute(`
          DROP TABLE IF EXISTS [users];
        `).then(() => resolve()).catch((error: Error) => reject(error));
    });
}