
declare module 'ftp-deploy' {
    type DeployConfiguration = {
        host: string,
        port: number,
        user?: string,
        password?: string,
        localRoot: string,
        remoteRoot: string,
        include: string[],
        exclude?: string[],
        deleteRemote: boolean,
        forcePasv: boolean,
        sftp: boolean,
    }

    type DeployUploadInfo = {
        totalFilesCount: number,
        transferredFileCount: number,
        filename: string,
    }

    declare class FtpDeploy {
        deploy(conf: DeployConfiguration): Promise<string[]>;
        on(event: 'uploading', callback: (data: DeployUploadInfo) => void): this;
        on(event: 'uploaded', callback: (data: DeployUploadInfo) => void): this;

    }

    export = FtpDeploy;
}