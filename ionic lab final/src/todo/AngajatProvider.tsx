import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { AngajatProps } from './AngajatProps';
import { createAngajat, getAngajats, newWebSocket, updateAngajat } from './angajatApi';
import { AuthContext } from '../auth';

const log = getLogger('AngajatProvider');

type SaveAngajatFn = (angajat: AngajatProps) => Promise<any>;
type UpdateServerFn = () => Promise<any>;

export interface AngajatsState {
    angajats?: AngajatProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveAngajat?: SaveAngajatFn,
    updateServer?: UpdateServerFn,

}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: AngajatsState = {
    fetching: false,
    saving: false,
};

const FETCH_ANGAJATS_STARTED = 'FETCH_ANGAJATS_STARTED';
const FETCH_ANGAJATS_SUCCEEDED = 'FETCH_ANGAJATS_SUCCEEDED';
const FETCH_ANGAJATS_FAILED = 'FETCH_ANGAJATS_FAILED';
const SAVE_ANGAJATS_STARTED = 'SAVE_ANGAJATS_STARTED';
const SAVE_ANGAJATS_SUCCEEDED = 'SAVE_ANGAJATS_SUCCEEDED';
const SAVE_ANGAJATS_FAILED = 'SAVE_ANGAJATS_FAILED';

const reducer: (state: AngajatsState, action: ActionProps) => AngajatsState =
    (state, { type, payload }) => {
        switch (type) {
            case FETCH_ANGAJATS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ANGAJATS_SUCCEEDED:
                return { ...state, angajats: payload.angajats, fetching: false };
            case FETCH_ANGAJATS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ANGAJATS_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ANGAJATS_SUCCEEDED:
                const angajats = [...(state.angajats || [])];
                const angajat = payload.angajat;
                const index = angajats.findIndex(it => it._id === angajat._id);
                if (index === -1) {
                    angajats.splice(0, 0, angajat);
                } else {
                    angajats[index] = angajat;
                }
                return { ...state, angajats, saving: false };
            case SAVE_ANGAJATS_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const AngajatContext = React.createContext<AngajatsState>(initialState);

interface AngajatProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AngajatProvider: React.FC<AngajatProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { angajats, fetching, fetchingError, saving, savingError } = state;
    useEffect(getAngajatsEffect, [token]);
    useEffect(wsEffect, [token]);

    const saveAngajat = useCallback<SaveAngajatFn>(saveAngajatCallback, [token]);
    const value = { angajats, fetching, fetchingError, saving, savingError, saveAngajat };
    log('returns');
    return (
        <AngajatContext.Provider value={value}>
            {children}
        </AngajatContext.Provider>
    );

    function getAngajatsEffect() {
        let canceled = false;
        fetchAngajats();
        return () => {
            canceled = true;
        }

        async function fetchAngajats() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchAngajats started');
                dispatch({ type: FETCH_ANGAJATS_STARTED });
                const angajats = await getAngajats(token);
                log('fetchAngajats succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ANGAJATS_SUCCEEDED, payload: { angajats } });
                }
            } catch (error) {
                log('fetchAngajats failed');
                dispatch({ type: FETCH_ANGAJATS_FAILED, payload: { error } });
            }
        }
    }

    async function saveAngajatCallback(angajat: AngajatProps) {
        try {
            log('saveAngajat started');
            dispatch({ type: SAVE_ANGAJATS_STARTED });
            const savedAngajat = await (angajat._id ? updateAngajat(token, angajat) : createAngajat(token, angajat));
            log('saveAngajat succeeded');
            dispatch({ type: SAVE_ANGAJATS_SUCCEEDED, payload: { angajat: savedAngajat} });
        } catch (error) {
            log('saveAngajat failed');
            dispatch({ type: SAVE_ANGAJATS_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const { type, payload: angajat } = message;
                log(`ws message, angajat ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({ type: SAVE_ANGAJATS_SUCCEEDED, payload: { angajat } });
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
