import { URL } from 'node:url';


export default function getProtocol(url: string, defaultProtocol: string = 'file'): string {
    const urlObj = new URL(url);
    return urlObj.protocol || defaultProtocol;
}