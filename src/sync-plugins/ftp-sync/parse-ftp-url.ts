

export type FtpInfo = {
    host: string,
    port: number,
    user?: string,
    password?: string,
    directory: string,
}


export default function parseFtpDestination(destination: string): FtpInfo | undefined {
    if (!destination.startsWith('ftp://')) {
        return;
    }

    const [remotePart, ...directoryParts] = destination.slice('ftp://'.length).split('/');

    if (directoryParts.length === 0) {
        return;
    }

    let [userPart, hostPart] = remotePart!.split('@')

    if (hostPart === undefined) {
        hostPart = userPart;
        userPart = undefined;
    }

    let user: string | undefined = userPart!;
    let password: string | undefined = undefined;
    if (userPart !== undefined) {
        [ user, password ] = userPart.split(':');
    }

    let host: string | undefined = hostPart!;
    let port: string | undefined = undefined;
    if (hostPart !== undefined) {
        [ host, port ] = hostPart.split(':');
    }

    return {
        directory: directoryParts.join('/'),
        host: host!,
        port: port !== undefined ? parseInt(port) : 21,
        password: password,
        user: user,
    }
}