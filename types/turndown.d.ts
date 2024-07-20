declare module "turndown" {
  class TurndownService {
    constructor(options?: object);
    turndown(html: string): string;
  }
  export = TurndownService;
}
