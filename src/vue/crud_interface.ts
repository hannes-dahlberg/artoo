import axios, { AxiosPromise, AxiosResponse } from "axios";

export default class CrudInterface<T> {
    public constructor(private path: string) { }

    public index(): (...args: any[]) => any {
        return ({ }: {}, params: { [key: string]: string } = {}): Promise<T[]> => (new Promise((resolve, reject) => {
            axios.get<T[]>(this.path, { params, withCredentials: true }).then((response: AxiosResponse<T[]>) => {
                resolve(response.data);
            }).catch((error: any) => reject(error));
        }));
    }

    public store(): (...args: any[]) => any {
        return ({ }: {}, data: any): Promise<T> => (new Promise((resolve, reject) => {
            axios.post(this.path, data).then(() => resolve()).catch((error: any) => reject(error));
        }));
    }

    public show(): ({ }: {}, id: number) => Promise<T> {
        return ({ }: {}, id: number) => (new Promise((resolve, reject) => {
            axios.get<T>(this.path + "/" + id.toString()).then((response: AxiosResponse<T>) => {
                resolve(response.data);
            }).catch((error: any) => reject(error));
        }));
    }

    public update<U extends { id: number }>(): ({ }: {}, data: U) => Promise<U> {
        return ({ }: {}, data: U) => (new Promise((resolve, reject) => {
            axios.put(this.path + "/" + data.id, data).then(() => resolve()).catch((error: any) => reject(error));
        }));
    }

    public destroy(): ({ }: {}, id: number) => Promise<void> {
        return ({ }: {}, id: number) => (new Promise((resolve, reject) => {
            axios.delete(this.path + "/" + id.toString()).then(() => resolve()).catch((error: any) => reject(error));
        }));
    }
}
