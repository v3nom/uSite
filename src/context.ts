import { IFileSystem } from "./fileSystem/ifileSystem";

export interface IContext {
    cwd: string;
    fs: IFileSystem
    [key: string]: any;
}