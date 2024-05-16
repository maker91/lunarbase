import { type ISyncPlugin, registerSyncPlugin } from "../../sync-plugin";
import parseFtpDestination from "./parse-ftp-url";
import FtpDeploy from "ftp-deploy";


class FtpSyncPlugin implements ISyncPlugin {

    async prepare(_destination: string): Promise<boolean> {
        return true;
    }

    async sync(source: string, destination: string): Promise<void> {
        const ftpInfo = parseFtpDestination(destination);
        if (ftpInfo === undefined) {
            return;
        }

        const deployConf = {
            user: ftpInfo.user,
            password: ftpInfo.password,
            host: ftpInfo.host,
            port: ftpInfo.port,
            localRoot: source,
            remoteRoot: ftpInfo.directory,
            include: ["*", "**/*", ".*", "**/.*"],
            exclude: [".git/**"],
            deleteRemote: true,
            forcePasv: true,
            sftp: false,
        }

        const ftpDeploy = new FtpDeploy()
            .on("uploading", (data) => {
                process.stdout.clearLine(0);
                process.stdout.write(`\r[${data.transferredFileCount}/${data.totalFilesCount}] Uploading ${data.filename}...`);
            })

        await ftpDeploy.deploy(deployConf);
        process.stdout.write('\n');
    }
}


registerSyncPlugin('ftp:', FtpSyncPlugin);