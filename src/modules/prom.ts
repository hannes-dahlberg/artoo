import * as Promise from "bluebird";

// Setting bluebird config
Promise.config({
    cancellation: true,
});

export enum mode {
    recursive,
    simultaneous,
}

export interface IOutput {
    results: Array<{ result?: any, error?: Error }>;
    resolves: number;
    rejects: number;
}

export class Prom {
    public static sequence(
        promises: Array<() => Promise<any>> = [],
        {
            useMode = mode.recursive,
            breakOnResolve = false,
            breakOnReject = false,
            resolveOutput = { results: [], resolves: 0, rejects: 0 } as IOutput,
        }: {
                useMode?: mode,
                breakOnResolve?: boolean,
                breakOnReject?: boolean,
                resolveOutput?: IOutput,
            } = {}): Promise<IOutput> {
        return new Promise((resolve: (thenableOrResult?: any | PromiseLike<any>) => void, reject: (error?: any) => void, onCancel?: (callback: () => void) => void) => {
            /*Recursive mode execute each promise in order. Next promise is not
            executed before the previous one has resolved (or rejected)*/
            if (useMode === mode.recursive) {
                // Method for making the next promise
                const nextProm = () => {
                    // Remove the previous executed promise from array
                    promises.splice(0, 1);
                    /*If the array still has promises. Call itself with the
                    spliced promise array*/
                    if (promises.length) {
                        // Execute and resolve output
                        const p = Prom.sequence(promises, { useMode, breakOnResolve, breakOnReject, resolveOutput }).then((result: any) => resolve(resolveOutput));
                        // Chaining down onCancel emitter
                        onCancel(() => p.cancel());
                    } else {
                        // Promise array is empty. Resolve the output
                        resolve(resolveOutput);
                    }
                };

                // If promise is not set simply call the next promise
                if (!promises[0]) { nextProm(); return; }

                // Execute promise
                const promise = promises[0]().then((result: any) => {
                    // Add result to output
                    resolveOutput.results.push({ result });
                    resolveOutput.resolves++;
                    // Resolve if breakOnResolve is true
                    if (breakOnResolve) { resolve(resolveOutput); return; }

                    // Execute next promise
                    nextProm();
                }).catch((error: any) => {
                    // Add error to output
                    resolveOutput.results.push({ error });
                    resolveOutput.rejects++;
                    // Resolve if breakOnReject is true
                    if (breakOnReject) { resolve(resolveOutput); return; }

                    // Execute next promise
                    nextProm();
                });

                // Cancel the current promise if onCancel is emitted
                onCancel(() => promise.cancel());
                /*Simultaneous mode execute all promises at the same time. Great for
                when resolving on first resolve or reject of any promise*/
            } else if (useMode === mode.simultaneous) {
                /*Creates an empty array for all output results. If it would
                push each result as it resolves/rejects they might not be in
                the same order as the provided promise array. This makes sure
                that the index of a promise in the promise array has its result
                on the same index in the results/errors array*/
                promises.forEach(() => {
                    resolveOutput.results.push({});
                });

                /*Container for all executed promises. Used for when sequence
                need to halt and end each promise already initiated*/
                const executedPromises: Array<Promise<any>> = [];

                // Handler for onCancel event
                onCancel(() => executedPromises.forEach((promise) => promise.cancel()));

                // Method to detect when to end the sequence and resolve
                const end = () => {
                    // Number of executed promises (resolved and rejected)
                    const numberOfExecutedPromises = resolveOutput.resolves + resolveOutput.rejects;
                    const numberOfPromises = promises.filter((promise) => promise).length;
                    // All promises has resolved or rejected, resolve output
                    if (numberOfExecutedPromises === numberOfPromises) {
                        resolve(resolveOutput);
                        return;
                    }

                    // If sequence should break on either first resolve or reject
                    if ((breakOnResolve && resolveOutput.resolves > 0) || breakOnReject && resolveOutput.rejects > 0) {
                        // Is there any promise still yet to be executed?
                        if (numberOfExecutedPromises < numberOfPromises) {
                            // call cancel on any remaining promise
                            executedPromises.forEach((promise) => promise.cancel());
                        }

                        // Resolve output
                        resolve(resolveOutput);
                    }
                };

                // Loop through each promise
                promises.forEach((promise, index) => {
                    /*No promise just resolves (when providing null
                    in the array of promises)*/
                    if (!promise) { return; }

                    /*Execute promise and replace it in the array by its call
                    return. For it to be possible to cancel later*/
                    executedPromises.push(promise().then((result: any) => {
                        // Add result and call end
                        resolveOutput.results[index].result = result;
                        resolveOutput.resolves++;
                        end();
                    }).catch((error: any) => {
                        // Add result and call end
                        resolveOutput.results[index].error = error;
                        resolveOutput.rejects++;
                        end();
                    }));
                });
            }
        });
    }
    public static wait(wait: number): Promise<void> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, wait);
        });
    }
    public static and(promises: any[], useMode: mode = mode.recursive) {
        return new Promise((resolve, reject) => {
            // Execute all promises but break on first rejection
            Prom.sequence(promises, { useMode, breakOnReject: true }).then((result: any) => {
                // If no promise was rejected resolve the result
                if (!result.errors.length) {
                    resolve(result);
                } else {    /*At least on promise was rejected, therefore the
                            the method itself will also reject*/
                    reject(result);
                }
            });
        });
    }
    public static or(promises: any[], useMode: mode = mode.recursive) {
        return new Promise((resolve, reject) => {
            // Execute all promises
            Prom.sequence(promises, { useMode }).then((result: any) => {
                /*If any of the promises resolved the method will resolve as
                well*/
                if (result.results.find((result: any) => result != null)) {
                    resolve(result);
                } else {
                    // Reject if all promises rejected
                    reject(result);
                }
            });
        });
    }
}
