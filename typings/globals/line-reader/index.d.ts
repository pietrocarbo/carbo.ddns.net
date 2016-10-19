// Generated by typings
// Source: https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/56295f5058cac7ae458540423c50ac2dcf9fc711/line-reader/line-reader.d.ts
interface LineReaderOptions {
	separator?: any;
	encoding?: string;
	bufferSize?: number;
}

interface LineReader {
	eachLine(): Function; // For Promise.promisify;
	open(): Function;
	eachLine(file: string, cb: (line: string, last?: boolean, cb?: Function) => void): LineReader;
	eachLine(file: string, options: LineReaderOptions, cb: (line: string, last?: boolean, cb?: Function) => void): LineReader;
	open(file: string, cb: (err: Error, reader: LineReader) => void): void;
	open(file: string, options: LineReaderOptions, cb: (err: Error, reader: LineReader) => void): void;
	hasNextLine(): boolean;
	nextLine(cb: (err: Error, line: string) => void): void;
	close(cb: (err: Error) => void): void;
}

declare module "line-reader" {
	var lr: LineReader;
	export = lr;
}