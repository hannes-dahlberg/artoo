export default class CrudInterface<T> {
    private path;
    constructor(path: string);
    index(): Function;
    store(): Function;
    show(): ({}: {}, id: number) => Promise<T>;
    update<T extends {
        id: number;
    }>(): ({}: {}, data: T) => Promise<T>;
    destroy(): ({}: {}, id: number) => Promise<void>;
}
