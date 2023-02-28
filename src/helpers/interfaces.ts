import { IncomingMessage } from 'http';
export interface GqlContext {
  authorization: string;
  req: IncomingMessage;
}
