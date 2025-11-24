export interface IFileSystem {
    isDirectory(path: string): boolean;
    joinPaths(a: string, b: string): string;
    mkdirs(path: string): void;

    readFile(path: string, encoding: string | { encoding: string }): string;
    writeFile(destination: string, content: string): void;

    exists(path: string): boolean;
    dirname(path: string): string;
    extname(path: string): string;
    copy(a: string, b: string): void;
}