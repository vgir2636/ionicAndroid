import {RouteComponentProps} from "react-router";

export interface AngajatProps
{
    _id?:string;
    nume:string;
    prenume:string;
    departament:string;
    active:string;
    photoPath: string;
    latitude:number;
    longitude:number;
}