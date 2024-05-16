import path from 'node:path'


interface LunarbaseConfig {
    homebase: string;
    lunarbase: string;
    destination: string;
    syncPluginDirs: string[];
}


function requiredEnvValue(key: string): string {
    const value = Bun.env[key];

    if (value === undefined) {
        throw new Error(`Missing configuration option '${key}'`);
    }

    return value;
}

function optionalEnvValue(key: string, defaultValue: string): string {
    const value = Bun.env[key];

    if (value === undefined) {
        return defaultValue;
    } else {
        return value;
    }
}

export function isConfigKey(key: string): key is keyof LunarbaseConfig {
   return key in config;
}

export function *listConfig(): Generator<string> {
    for (const [ key, value ] of Object.entries(config)) {
        yield `${key} = ${value}`;
    }
}

const config: LunarbaseConfig = {
    homebase: requiredEnvValue('homebase'),
    lunarbase: optionalEnvValue('lunarbase', path.join(__dirname, '../.lunarbase/')),
    destination: requiredEnvValue('destination'),
    syncPluginDirs: optionalEnvValue('syncPluginDirs', path.join(__dirname, 'sync-plugins'))
        .split(',').map(dir => dir.trim()),
};

export default config;