import React, {useContext, useEffect, useState} from 'react';
import {
    IonActionSheet,
    IonButton,
    IonButtons,
    IonContent, IonFab, IonFabButton,
    IonHeader, IonIcon,
    IonInput, IonItem, IonLabel, IonListHeader,
    IonLoading,
    IonPage, IonRadio, IonRadioGroup,
    IonTitle,
    createAnimation,
    IonToolbar,
    IonImg
} from '@ionic/react';
import {getLogger} from '../core';
import {AngajatContext} from './AngajatProvider';
import {RouteComponentProps} from 'react-router';
import {AngajatProps} from './AngajatProps';
import {camera, close, trash} from "ionicons/icons";
import {Photo, usePhotoGallery} from "./usePhotoGallery";
import {MyMap} from "./MyMap";
import {CreateAnimation, Animation} from '@ionic/react';
// @ts-ignore
import {MyModal} from "./MyModal";

const log = getLogger('PersonEdit');

interface AngajatEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const AngajatEdit: React.FC<AngajatEditProps> = ({history, match}) => {
    const {angajats, saving, savingError, saveAngajat} = useContext(AngajatContext);
    const [nume, setNume] = useState('');
    const [prenume, setPrenume] = useState('');
    const [departament, setdepartament] = useState('');
    const [active, setActive] = useState('');
    const [photoPath, setPhotoPath] = useState('');
    const [latitude, setLatitude] = useState(46.7533824);
    const [longitude, setLongitude] = useState(23.5831296);
    const [angajat, setAngajat] = useState<AngajatProps>();
    const {photos, takePhoto, deletePhoto} = usePhotoGallery();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const stud = angajats?.find(it => it._id === routeId);
        setAngajat(stud);
        if (stud) {
            setNume(stud.nume);
            setPrenume(stud.prenume);
            setdepartament(stud.departament);
            setActive(stud.active);
            setPhotoPath(stud.photoPath);
            if (stud.latitude) setLatitude(stud.latitude);
            if (stud.longitude) setLongitude(stud.longitude);
        }
    }, [match.params.id, angajats]);

    const handleSave = () => {
        const editedAngajat = angajat
            ? {
                ...angajat,
                nume,
                prenume,
                departament,
                active,
                photoPath,
                latitude,
                longitude
            }
            : {
                nume,
                prenume,
                departament,
                active,
                photoPath,
                latitude,
                longitude
            };
        saveAngajat && saveAngajat(editedAngajat).then(() => {
            history.goBack();
        })
    };

    function simpleAnimations() {
        const image = document.querySelector('.image');
        if (image) {
            const animation = createAnimation()
                .addElement(image)
                .duration(1000)
                .direction('alternate')
                .iterations(Infinity)
                .keyframes([
                    {offset: 0, transform: 'scale(1)', opacity: '1'},
                    {
                        offset: 1, transform: 'scale(0.5)', opacity: '0.5'
                    }
                ]);
            animation.play();

        }
    }

    function groupAnimations() {
        const image = document.querySelector('.image');
        const map = document.querySelector('.map');
        if (image && map) {
            const animationA = createAnimation()
                .addElement(image)
                .fromTo('transform', 'scale(0.5)', 'scale(1)');
            const animationB = createAnimation()
                .addElement(map)
                .fromTo('transform', 'scale(1)', 'scale(0.5)');
            const parentAnimation = createAnimation()
                .duration(10000)
                .addAnimation([animationA, animationB]);
            parentAnimation.play();
        }
    }

    function chainAnimations() {
        const elB = document.querySelector('.image');
        const elC = document.querySelector('.map');
        if (elB && elC) {
            const animationA = createAnimation()
                .addElement(elB)
                .duration(3000)
                .fromTo('transform', 'scale(0.5)', 'scale(1)')
                .afterStyles({
                    'background': 'black'
                });
            const animationB = createAnimation()
                .addElement(elC)
                .duration(5000)
                .fromTo('transform', 'scale(0.5)', 'scale(1)')
                .afterStyles({
                    'background': 'black'
                });
            (async () => {
                await animationA.play();
                await animationB.play();
            })();
        }
    }

    //useEffect(chainAnimations, []);
    // useEffect(simpleAnimations, []);
    useEffect(chainAnimations, []);
    if(!photoPath)
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <div ><IonLabel>Nume:</IonLabel></div>
                    <IonInput
                        id={"l1"}
                        className="inputField"
                        value={nume}
                        onIonChange={e => setNume(e.detail.value || '')}/>
                </IonItem>
                <IonItem>
                    <div><IonLabel>Prenume:</IonLabel></div>
                    <IonInput
                        id={"l2"}
                        className="inputField"
                        value={prenume}
                        onIonChange={e => setPrenume(e.detail.value || '')}/>
                </IonItem>
                <div className="image">
                <IonImg
                    className="image"
                    style={{width: "500px", height: "500px", margin: "0 auto"}}
                    onClick={() => {
                        setPhotoToDelete(photos?.find(item => item.webviewPath === photoPath))
                    }}
                    alt={"No photo"}
                    src="https://i.imgur.com/QiGPpDO.png"
                />
                </div>
                

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton
                        onClick={() => {
                            const photoTaken = takePhoto();
                            photoTaken.then((data) => {
                                setPhotoPath(data.webviewPath!);
                            });
                        }}
                    >
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>

                <div className="map">
                <MyMap
                    
                    lat={latitude}
                    lng={longitude}
                    onMapClick={(location: any) => {
                        setLatitude(location.latLng.lat());
                        setLongitude(location.latLng.lng());
                    }}
                />
                </div>

                    <IonActionSheet
                        isOpen={!!photoToDelete}
                        buttons={[
                            {
                                text: "Delete",
                                role: "destructive",
                                icon: trash,
                                handler: () => {
                                    if (photoToDelete) {
                                        deletePhoto(photoToDelete);
                                        setPhotoToDelete(undefined);
                                        setPhotoPath("")
                                    }
                                },
                            },
                            {
                                text: "Cancel",
                                icon: close,
                                role: "cancel",
                            },
                        ]}
                        onDidDismiss={() => setPhotoToDelete(undefined)}
                    />
            </IonContent>
        </IonPage>
);
// in cazul in care exista poza de profil
return (
    <IonPage>
        <IonHeader>
            <IonToolbar>
                <IonTitle>Edit</IonTitle>
                <IonButtons slot="end">
                    <IonButton onClick={handleSave}>
                        Save
                    </IonButton>

                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent>
            <IonItem>
                <div><IonLabel>Nume:</IonLabel></div>
                <IonInput
                    id={"l1"}
                    className="inputField"
                    value={nume}
                    onIonChange={e => setNume(e.detail.value || '')}/>
            </IonItem>
            <IonItem>
                <div><IonLabel>Prenume:</IonLabel></div>
                <IonInput
                    id={"l2"}
                    className="inputField"
                    value={prenume}
                    onIonChange={e => setPrenume(e.detail.value || '')}/>
            </IonItem>

            <div className="image">
            <IonImg
                style={{width: "500px", height: "500px", margin: "0 auto"}}
                src={photoPath}
            />
            </div>
            <IonButton color="primary" style={{width: "256px", height: "64px", left:"50%"}}
                            onClick={() => {
                                setPhotoToDelete(photos?.find(item => item.webviewPath === photoPath))
                            }}
                            >Edit Profile Image</IonButton>
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
                <IonFabButton
                    onClick={() => {
                        const photoTaken = takePhoto();
                        photoTaken.then((data) => {
                            setPhotoPath(data.webviewPath!);
                        });
                    }}
                >
                    <IonIcon icon={camera}/>
                </IonFabButton>
            </IonFab>
            <div className="map">
                <MyMap
                    
                    lat={latitude}
                    lng={longitude}
                    onMapClick={(location: any) => {
                        setLatitude(location.latLng.lat());
                        setLongitude(location.latLng.lng());
                    }}
                />
            </div>

                <IonActionSheet
                    isOpen={!!photoToDelete}
                    buttons={[
                        {
                            text: "Delete",
                            role: "destructive",
                            icon: trash,
                            handler: () => {
                                if (photoToDelete) {
                                    deletePhoto(photoToDelete);
                                    setPhotoToDelete(undefined);
                                    setPhotoPath("")
                                }
                            },
                        },
                        {
                            text: "Cancel",
                            icon: close,
                            role: "cancel",
                        },
                    ]}
                    onDidDismiss={() => setPhotoToDelete(undefined)}
                />
        </IonContent>
    </IonPage>
);
};

export default AngajatEdit;
