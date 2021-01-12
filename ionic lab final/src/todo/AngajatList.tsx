import React, {useContext, useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {Redirect} from "react-router-dom";
import {
    IonButton, IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent,
    IonLoading,
    IonPage, IonSearchbar, IonSelect, IonSelectOption,
    IonTitle,
    IonLabel,
    IonToolbar
} from '@ionic/react';
import {add} from 'ionicons/icons';
import Angajat from './Angajat';
import {getLogger} from '../core';
import {AngajatContext} from './AngajatProvider';
import {AuthContext} from "../auth";
import {AngajatProps} from "./AngajatProps";
import {useNetwork} from './useNetwork';
import {useAppState} from "./useAppState";

const log = getLogger('PersonList');

const AngajatList: React.FC<RouteComponentProps> = ({history}) => {
    const {angajats, fetching, fetchingError} = useContext(AngajatContext);
    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(
        false
    );
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>('');
    const [pos, setPos] = useState(10);
    const selectOptions = ["true", "false"];
    const [angajatsShow, setAngajatsShow] = useState<AngajatProps[]>([]);
    const {appState} = useAppState();
    const {networkStatus} = useNetwork();
    const { logout } = useContext(AuthContext);

    log("render");
    const handleLogout = () => {
        logout?.();
        return <Redirect to={{ pathname: "/login" }} />;
    };
    async function searchNext($event: CustomEvent<void>) {
        if (angajats && pos < angajats.length) {
            setAngajatsShow([...angajats.slice(0, 10 + pos)]); //
            setPos(pos + 5);
        } else {
            setDisableInfiniteScroll(true);
        }
        await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    useEffect(() => {
        if (angajats?.length) {
            setAngajatsShow(angajats.slice(0, pos));
        }
    }, [pos, angajats]);

    useEffect(() => {
        if (filter && angajats) {
            setAngajatsShow(angajats.filter((angajat) => angajat.active === filter));
        }
    }, [filter, angajats]);

    useEffect(() => {
        if (search && angajats) {
            setAngajatsShow(angajats.filter((angajat) => angajat.nume.startsWith(search)));
        }
    }, [search, angajats]);




    return (
        <IonPage>
            <IonHeader>
                <IonTitle id={"status"}></IonTitle>

            </IonHeader>

            <IonContent fullscreen>
                <div>Network status is {JSON.stringify(networkStatus)}</div>
                    <IonButton onClick={handleLogout}>
                        Logout
                    </IonButton>
                <IonLoading isOpen={fetching} message="Fetching angajats"/>

                <IonSearchbar
                    value={search}
                    debounce={1000}
                    onIonChange={(e) => setSearch(e.detail.value!)}
                ></IonSearchbar>
                <IonSelect
                    value={filter}
                    placeholder="Active"
                    onIonChange={(e) => setFilter(e.detail.value)}
                >
                    {selectOptions.map((option) => (
                        <IonSelectOption key={option} value={option}>
                            {option}
                        </IonSelectOption>
                    ))}
                </IonSelect>
                
                {angajatsShow &&
                angajatsShow.map((person: AngajatProps) => {
                    return (
                        <Angajat
                            key={person._id}
                            _id={person._id}
                            nume={person.nume}
                            prenume={person.prenume}
                            departament={person.departament}
                            active={person.active}
                            photoPath={person.photoPath}
                            latitude={person.latitude}
                            longitude={person.longitude}
                            onEdit={(id) => history.push(`/angajat/${id}`)}
                        />
                    );
                })}
                <IonInfiniteScroll
                    threshold="100px"
                    disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading more contacts..."></IonInfiniteScrollContent>
                </IonInfiniteScroll>
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch Persons'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/angajat')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>





                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default AngajatList;
