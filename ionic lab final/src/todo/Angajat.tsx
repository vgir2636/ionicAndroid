import React from 'react';
import {IonItem, IonLabel, IonButton,} from '@ionic/react';
import {AngajatProps} from './AngajatProps';

interface AngajatPropsExt extends AngajatProps {
    onEdit: (id?: string) => void;
}

const Angajat: React.FC<AngajatPropsExt> = ({_id, nume, prenume, departament, active, onEdit}) => {
    return (



        <IonItem onClick={() => onEdit(_id)}>

            <IonLabel> {_id}</IonLabel>
            <IonLabel>{nume}</IonLabel>
            <IonLabel>{prenume}</IonLabel>
            <IonLabel>{departament}</IonLabel>
            <IonLabel>{active}</IonLabel>

        </IonItem>
    );

};

export default Angajat;
