import React, { useContext, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('Login');

interface LoginState {
    email?: string;
    parola?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
    const { isAuthenticated, isAuthenticating, login, authenticationError } = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const { email, parola } = state;
    const handleLogin = () => {
        log('handleLogin...');
        login?.(email, parola);
    };
    log('render');
    if (isAuthenticated) {
        return <Redirect to={{ pathname: '/' }} />
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Logare</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    className="inputField"
                    placeholder="email"
                    value={email}
                    onIonChange={e => setState({
                        ...state,
                        email: e.detail.value || ''
                    })}/>
                <IonInput
                    className="inputField"
                    placeholder="parola"
                    value={parola}
                    onIonChange={e => setState({
                        ...state,
                        parola: e.detail.value || ''
                    })}/>
                <IonLoading isOpen={isAuthenticating}/>
                {authenticationError && (
                    <div>{authenticationError.message || 'Failed to authenticate'}</div>
                )}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    );
};
