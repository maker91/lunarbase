import fs from 'node:fs'
import path from 'node:path'
import config, { isConfigKey } from './config';
import { type Either, ok, fail } from './util/either';
import execute from './util/execute';
import { getSyncPlugin } from './sync-plugin';
import getProtocol from './util/protocol';


export const INIT_ERRORS = {
    E_ALREADY_EXISTS: 1,
} as const;
export type InitError = typeof INIT_ERRORS[keyof typeof INIT_ERRORS];

export async function initLunarbase(force: boolean = false): Promise<Either<void, InitError>> {
    // Make sure the lunarbase directory exists before initialising
    if (!fs.existsSync(config.lunarbase)) {
        console.log(`Creating lunarbase: '${config.lunarbase}'`)
        fs.mkdirSync(config.lunarbase, { recursive: true });
    }

    // If a .git directory already exists in the lunarbase then fail
    if (fs.existsSync(path.join(config.lunarbase, '.git'))) {
        if (force) {
            console.log(`git repository already exists at '${config.lunarbase}'. Overwriting...`);
            fs.rmSync(path.join(config.lunarbase, '.git'), { recursive: true, force: true })
        } else {
            return fail(INIT_ERRORS.E_ALREADY_EXISTS);
        }
    }

    await execute({script: 'init-lunarbase'});
    return ok(undefined);
}


export const GET_CONFIG_VALUE_ERRORS = {
    E_INVALID_KEY: 1,
 } as const;
export type GetConfigValueError = typeof GET_CONFIG_VALUE_ERRORS[keyof typeof GET_CONFIG_VALUE_ERRORS];

export function getConfigValue(key: string): Either<unknown, GetConfigValueError> {
    if (!isConfigKey(key)) {
        return fail(GET_CONFIG_VALUE_ERRORS.E_INVALID_KEY);
    }

    return ok(config[key]);
}


export const LAUNCH_SPECIFIER_ERRORS = {
    E_NO_LATEST_TAG: 1,
    E_NO_SYNC_PLUGIN: 2,
    E_PREPARATION: 3,
} as const;
export type LaunchSpecifierError = typeof LAUNCH_SPECIFIER_ERRORS[keyof typeof LAUNCH_SPECIFIER_ERRORS];

export async function launchSpecifier(specifier: string): Promise<Either<void, LaunchSpecifierError>> {
    // Get the correct sync plugin
    const protocol = getProtocol(config.destination);
    const syncPlugin = getSyncPlugin(protocol);
    if (syncPlugin === undefined) {
        return fail(LAUNCH_SPECIFIER_ERRORS.E_NO_SYNC_PLUGIN);
    }
    
    if (specifier === 'latest') {
        specifier = await execute({
            script: 'get-latest-tag',
            quiet: true,
        });

        if (specifier == '') {
            return fail(LAUNCH_SPECIFIER_ERRORS.E_NO_LATEST_TAG);
        }

        console.log(`Resolved 'latest' specifier to '${specifier}'`);
    }

    // Do a clean checkout of the specifier commit
    await execute({
        script: 'clean-checkout',
        args: [specifier],
        quiet: true,
    });

    const destinationFilepath = `${config.destination}/${specifier}`;
    const prepared = await syncPlugin.prepare(destinationFilepath);
    if (!prepared) {
        return fail(LAUNCH_SPECIFIER_ERRORS.E_PREPARATION);
    }

    console.log(`🚀 Launching '${specifier}' from lunarbase to destination '${config.destination}...'`)
    await syncPlugin.sync(config.lunarbase, destinationFilepath);
    console.log(`🎉 Launch was successful!`)
    
    return ok();
}