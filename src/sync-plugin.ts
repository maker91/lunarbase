
export interface ISyncPlugin {
    prepare(destination: string): Promise<boolean>;
    sync(source: string, destination: string): Promise<void>;
}

type SyncPluginConstructor = new () => ISyncPlugin;


const syncPluginRegistry: Record<string, SyncPluginConstructor> = {};

export function registerSyncPlugin(protocol: string, plugin: SyncPluginConstructor): void {
    syncPluginRegistry[protocol] = plugin;
}

export function getSyncPlugin(protocol: string): ISyncPlugin | undefined {
    const syncPluginConstructor = syncPluginRegistry[protocol];
    if (syncPluginConstructor === undefined) {
        return;
    }
    
    return new syncPluginConstructor();
}