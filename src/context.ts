import { IFileSystem } from "./fileSystem/ifileSystem.js";

export interface IContext {
    cwd: string;
    fs: IFileSystem
    [key: string]: any;
}