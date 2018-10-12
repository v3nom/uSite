export interface IFileSystem {
    isDirectory(path: string): boolean;
    joinPaths(a: string, b: string): string;
    mkdirs(path: string);
    exists(path: string): boolean;
    readFile(path: string, encoding: string | { encoding: string });
    writeFile(destination: string, content: string)
    dirname(path: string): string;
    extname(path: string): string;
    copy(a: string, b: string);
}