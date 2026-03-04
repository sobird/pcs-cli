/// <reference types="vitest/globals" />
declare module 'commander' {
  export * from '@commander-js/extra-typings';
}

declare module 'cliui' {
  interface UIOptions {
    width?: number;
    wrap?: boolean;
    rows?: string[];
  }
  interface Column {
    text: string;
    width?: number;
    align?: 'right' | 'left' | 'center';
    padding: number[];
    border?: boolean;
  }
  interface ColumnArray extends Array<Column> {
    span: boolean;
  }
  interface Line {
    hidden?: boolean;
    text: string;
    span?: boolean;
  }
  declare class UI {
    public width: number;
    public wrap: boolean;
    public rows: ColumnArray[];
    constructor(opts: UIOptions);
    public span(...args: ColumnArray): void;
    public resetOutput(): void;
    public div(...args: (Column | string)[]): ColumnArray;
    public toString(): string;
    public rowToString(row: ColumnArray, lines: Line[]): Line[];
  }
  declare function ui(opts: UIOptions): UI;
  export default ui;
}
