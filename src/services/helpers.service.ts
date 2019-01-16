import * as BluebirdPromise from "bluebird";
import * as _jwt from "jsonwebtoken";
import * as _ from "lodash";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { RSA_NO_PADDING } from "constants";

// Obtain the parameters of a function type in a tuple
export type ParametersType<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;
// Obtain the parameters of a constructor function type in a tuple
export type ConstructorParametersType<T extends new (...args: any[]) => any> = T extends new (...args: infer P) => any ? P : never;
// Obtain the return type of a function type
export type ReturnTypeType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : any;
// Obtain the return type of a constructor function type
export type InstanceTypeType<T extends new (...args: any[]) => any> = T extends new (...args: any[]) => infer R ? R : any;

export class HelperService {

    public toJson(object: any): JSON {
        return JSON.parse(JSON.stringify(object));
    }

    public dateFormat(date?: Date): string {
        if (!date) { date = new Date(); }

        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();

        return year.toString() +
            (month < 10 ? "0" + month.toString() : month.toString()) +
            (day < 10 ? "0" + day.toString() : day.toString()) +
            "_" +
            (hour < 10 ? "0" + hour.toString() : hour.toString()) +
            (minute < 10 ? "0" + minute.toString() : minute.toString()) +
            (second < 10 ? "0" + second.toString() : second.toString());
    }
    public substr(input: string, start?: number, end?: number): string {
        if (start === undefined) { start = 0; }
        if (end === undefined) { end = input.length; }

        if (start < 0) { start = input.length + start; }
        if (start < 0) { start = 0; }

        if (end >= 0) { end = start + end; }
        if (end < 0) { end = input.length + end; }
        if (end < 0) { end = 0; }

        return input.substring(start, end);
    }
    public ucFirst(value: string): string {
        return value.slice(0, 1).toUpperCase() + value.slice(1, value.length);
    }
    public lcFirst(value: string): string {
        return value.slice(0, 1).toLowerCase() + value.slice(1, value.length);
    }
    public groupBy(objects: Array<{ [key: string]: any }>, keys: string | string[]): any {
        // If keys is a string convert it to array
        if (typeof keys === "string") {
            keys = [keys];
        }

        // Creating a hash to work as key to group by
        const hashKey: string = (new Date()).getTime().toString() + (Math.floor(Math.random() * 10) + 1).toString();

        const groups = _.groupBy(objects.map((object) => {
            return {
                /*Creating single value of all keys to group by
                and assigning it to key using the hash as name*/
                [hashKey]: (keys as string[]).map((key: string) => object[key]).join(""),
                // Add the rest of the values
                ...object,
            };
            // Group by hash key
        }), hashKey);
        return Object.keys(groups).map((groupKey: string) => {
            const object: any = {};
            /*Add each key from the first row in the group with
            a value in the keys array*/
            (keys as string[]).forEach((key: string) => object[key] = groups[groupKey][0][key]);

            // Declare placholder for the rest of the values
            object._rows = [];

            // Walk through each row in the group
            groups[groupKey].forEach((row: any) => {
                // Create temp container object
                const tempRow: any = {};
                Object.keys(row).filter((key: string) => [hashKey].concat(keys).indexOf(key) === -1).forEach((key) => {
                    /*Add each value in the array with a key value NOT
                    part of the keys array*/
                    tempRow[key] = row[key];
                });

                // Push the temp container to _rows
                object._rows.push(tempRow);
            });

            // Return new object
            return object;
        });
    }
    public unique(array: string[]): string[] {
        const returnArray: string[] = [];
        array.forEach((item: string) => {
            if (returnArray.indexOf(item) === -1) {
                returnArray.push(item);
            }
        });

        return returnArray;
    }
    public isValidDate(date: Date): boolean {
        return date instanceof Date && !isNaN(date as any);
    }
    public promiseToBluebird<T>(promise: Promise<T>): BluebirdPromise<T> {
        return new BluebirdPromise((resolve, reject) => promise.then((result) => resolve(result)).catch((error: any) => reject(error)));
    }

    public pad(input: number, size: number, fill: string = "0"): string {
        let output: string = input.toString();
        while (output.length < size) { output = "0" + output; }
        return output;
    }

    public isInt(input: string) {
        return this.pad(parseInt(input, 10), input.length) === input;
    }

    public isDecimal(input: string) {
        return this.pad(parseFloat(input), input.length) === input;
    }

    public dotAnnotaion(object: any, annotation: string, setValue?: ((originalValue: any) => any) | any): any {
        const path = annotation.split(".");
        while (path.length > 1) {
            object = object[path.shift()];
        }
        if (setValue !== undefined) {
            const tempPath: string = path.shift();
            object[tempPath] = typeof setValue === "function" ? setValue(object[tempPath]) : setValue;
        }

        return object[path.shift()];
    }

    public readFileByLine(filePath: string, callback: (line: string, index?: number) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            let index: number = 0;
            readline.createInterface({
                input: fs.createReadStream(filePath),
                crlfDelay: Infinity
            }).on("line", (line: string) => callback(line, index++))
                .on("close", () => resolve());
        });
    }

    public fileFirstLine(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(filePath, "utf8");
            let line: string = "";
            readStream.on("data", (chunk: string) => {
                let newLineIndex = chunk.indexOf("\n");
                line += chunk.substr(0, newLineIndex !== 0 ? newLineIndex : chunk.length);
                if (newLineIndex != 0) { readStream.close(); }
            }).on("close", () => resolve(line))
                .on("error", (error: any) => reject(error));
        });
    }

    public prependLineToFile(filePath: string, newLine: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.readFile(filePath, "utf-8", (error: any, data: string) => {
                if (error) { reject(error); }
                let lines: string[] = data.split("\n");
                lines.splice(0, 0, newLine);

                fs.writeFile(filePath, lines.join("\n"), "utf-8", (error: any) => {
                    if (error) { reject(error); return; }
                    resolve();
                });
            });
        });
    }
}
