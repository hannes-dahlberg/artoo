interface config {
    paths: {
        storage: string;
        models: string;
        serverStaticDefaultPath: string;
        [key: string]: string;
    };
}
declare let config: config;
export default config;
