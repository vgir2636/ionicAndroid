import dataStore from 'nedb-promise';

export class AngajatStore {
    constructor({ filename, autoload }) {
        this.store = dataStore({ filename, autoload });
    }

    async find(props) {
        return this.store.find(props);
    }

    async findOne(props) {
        return this.store.findOne(props);
    }

    async insert(angajat) {
        let nume=angajat.nume;
        let prenume=angajat.prenume;
        let departament=angajat.departament;
        if (!nume || !prenume || !departament ) { // validation
            throw new Error('Something is missing');
        }

            return this.store.insert(angajat);
    };

    async update(props, angajat) {
        return this.store.update(props, angajat);
    }

    async remove(props) {
        return this.store.remove(props);
    }


}

export default new AngajatStore({ filename: './db/angajati.json', autoload: true });