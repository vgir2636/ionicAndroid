import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';

const authUrl = `http://${baseUrl}/api/auth/login`;

export interface AuthProps {
    token: string;
}

export const login: (email?: string, parola?: string) => Promise<AuthProps> = (email, parola) => {
    return withLogs(axios.post(authUrl, { email, parola }, config), 'login');
}
