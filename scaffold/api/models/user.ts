import { Models, storageInstance, storage } from 'artoo';

export class User extends Models.User {
  public static getByEmail(email: string): Promise<storage.entity> {
        return new Promise((resolve, reject) => {
            storageInstance.db.get(`SELECT * FROM [${this.table}] WHERE [email] = '${email}'`, (error: Error, row: any) => {
                if(error) { reject(error); return; }
                resolve(row);
            });
        });
    }
}