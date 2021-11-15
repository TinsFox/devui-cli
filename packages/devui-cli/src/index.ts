// @ts-ignore
import packageJson from '../package.json';
import {dev} from './commands/dev';

export const cliVersion: string = packageJson.version;
export {
    dev,
};
