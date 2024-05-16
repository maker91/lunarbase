import { Glob } from 'bun';
import config from './config'


export default async function loadSyncPlugins(): Promise<void> {
    const fileGlob = new Glob('*.ts');
    const dirGlob = new Glob('**/index.ts');

    for (const pluginDir of config.syncPluginDirs) {
        for await (const filepath of fileGlob.scan({ cwd: pluginDir, absolute: true })) {
            await import(filepath);
        }

        for await (const filepath of dirGlob.scan({ cwd: pluginDir, absolute: true })) {
            await import(filepath);
        }
    }
}