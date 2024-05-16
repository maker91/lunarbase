import bun from 'bun';
import path from 'node:path';


async function *getFilesRecursive(directory: string): AsyncIterable<string> {
    const glob = new bun.Glob('**/*');
    for await (const file of glob.scan({ cwd: directory, dot: true })) {
        yield file;
    }
}

export default async function copyRecursive(source: string, dest: string): Promise<void> {
    for await (const filepath of getFilesRecursive(source)) {
        // We don't want to launch the git repository directory!
        if (filepath.startsWith('.git')) {
            continue;
        }

        const srcFile = bun.file(path.join(source, filepath));
        const destFile = bun.file(path.join(dest, filepath));
        bun.write(destFile, srcFile);
    }
}