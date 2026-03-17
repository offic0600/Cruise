declare module 'turndown' {
  interface TurndownOptions {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '-' | '*' | '+';
    codeBlockStyle?: 'indented' | 'fenced';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '__' | '**';
  }

  interface Rule {
    filter: string | string[] | ((node: Node, options: TurndownOptions) => boolean);
    replacement: (content: string, node: Node, options: TurndownOptions) => string;
  }

  export default class TurndownService {
    constructor(options?: TurndownOptions);
    addRule(key: string, rule: Rule): TurndownService;
    turndown(input: string | Node): string;
  }
}
