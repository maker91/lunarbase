import { $ } from 'bun'
import config from '../config'


type ExecuteParams = {
    script: string,
    args?: string[],
    quiet?: boolean,
    cwd?: string,
    env?: Record<string, string>
}


/**
 * Execute a bun shell script
 */
export default async function execute(options: ExecuteParams): Promise<string> {
    const args = options.args ?? [];
    const quiet = options.quiet ?? false;
    const cwd = options.cwd ?? config.lunarbase;
    const env = options.env ?? {
        homebase: config.homebase,
        lunarbase: config.lunarbase,
        destination: config.destination,
    };

    const shellPromise = $`bun ${__dirname}/../scripts/${options.script}.bun.sh ${args.join(' ')}`
        .cwd(cwd)
        .env(env);

    if (quiet) {
        shellPromise.quiet();
    }

    const result = await shellPromise;
    return result.text().trim();
}