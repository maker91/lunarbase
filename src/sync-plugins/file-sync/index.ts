import fs from 'node:fs'
import { fileURLToPath } from 'bun';
import { type ISyncPlugin, registerSyncPlugin } from "../../sync-plugin";
import copyRecursive from './copy-recursive';


class FileSyncPlugin implements ISyncPlugin {

    async prepare(destination: string): Promise<boolean> {
        destination = fileURLToPath(destination);

        // Make sure the destination directory exists
        if (!fs.existsSync(destination)) {
            console.log(`Creating destination directory: '${destination}'`)
            fs.mkdirSync(destination, { recursive: true });
        } else {
            fs.rmSync(destination, { recursive: true, force: true });
        }
        
        return true;
    }

    async sync(source: string, destination: string): Promise<void> {
        await copyRecursive(source, fileURLToPath(destination));
    }
}

registerSyncPlugin('file:', FileSyncPlugin);