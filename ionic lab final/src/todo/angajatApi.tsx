import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { AngajatProps } from './AngajatProps';

const angajatUrl = `http://${baseUrl}/api/angajat`;

export const getAngajats: (token: string) => Promise<AngajatProps[]> = token => {
    return withLogs(axios.get(angajatUrl, authConfig(token)), 'getAngajats');
}

export const createAngajat: (token: string, angajat: AngajatProps) => Promise<AngajatProps[]> = (token, angajat) => {
    return withLogs(axios.post(angajatUrl, angajat, authConfig(token)), 'createAngajat');
}

export const updateAngajat: (token: string, angajat: AngajatProps) => Promise<AngajatProps[]> = (token, angajat) => {
    return withLogs(axios.put(`${angajatUrl}/${angajat._id}`, angajat, authConfig(token)), 'updateAngajat');
}

interface MessageData {
    type: string;
    payload: AngajatProps;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`);
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
