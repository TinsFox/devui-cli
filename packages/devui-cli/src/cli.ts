import {Command} from 'commander';

import {
    dev,
    cliVersion,
} from '.';

const program = new Command();

program.version(`@devui/devui-cli ${cliVersion}`);

program.command('dev').description('Run dev server').action(dev);


program.parse();
