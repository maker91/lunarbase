
import { Command } from 'commander';
import config, { listConfig } from './config';
import { 
    getConfigValue, initLunarbase, GET_CONFIG_VALUE_ERRORS, INIT_ERRORS,
     launchSpecifier, LAUNCH_SPECIFIER_ERRORS
} from '.';
import loadSyncPlugins from './sync-plugin-loader';


async function run() {
    await loadSyncPlugins();

    const cli = new Command('lunarbase')
        .description("");

    cli.command('init')
        .description("Initialises the lunarbase directory by cloning the homebase and pulling tags")
        .option('-f, --force', 'Force the override of an existing git repository in the lunarbase')
        .action(async (options) => {
            const either = await initLunarbase(options.force);

            if (!either.ok) {
                switch (either.error) {
                    case INIT_ERRORS.E_ALREADY_EXISTS:
                        cli.error(`git repository already exists at '${config.lunarbase}'`);
                }
            }
        });

    cli.command('launch')
        .description("")
        .argument('<specifier>', "The commit specifier to launch. Can be a branch, tag, commit hash, or 'latest'")
        .action(async (specifier: string): Promise<void> => {
            const either = await launchSpecifier(specifier);

            if (either.ok) {
                return;
            }

            switch (either.error) {
                case LAUNCH_SPECIFIER_ERRORS.E_NO_LATEST_TAG:
                    cli.error(`No 'latest' tag can be found`);
                    break;

                case LAUNCH_SPECIFIER_ERRORS.E_NO_SYNC_PLUGIN:
                    cli.error(`No sync plugin found that matches destination: '${config.destination}'`);
                    break;
            }
        })

    cli.command('config')
        .description('Config related subcommands')
        .addCommand(
            new Command('list')
                .description('List the lunarbase config')
                .action(() => {
                    for (const entry of listConfig()) {
                        console.log(entry);
                    }
                })
        )
        .addCommand(
            new Command('get')
                .description('Get a config value')
                .argument('<key>')
                .action((key: string): void => {
                    const either = getConfigValue(key);

                    if (either.ok) {
                        console.log(either.value);
                        return;
                    }
                    
                    switch (either.error) { 
                        case GET_CONFIG_VALUE_ERRORS.E_INVALID_KEY:
                            cli.error(`Invalid config key '${key}'`);
                            break;
                    }
                })
        );

    await cli.parseAsync();
}

await run();