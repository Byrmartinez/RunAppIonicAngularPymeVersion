// src/app/models/envio.model.ts

export class DatosPyme {
    id:string;
    idUsuario: string;
    nombre: string;
    email: string;
    plan: string;
    saldo: number;
    deuda: number;


    constructor(data?: any) {
        this.id = data.id;
        this.idUsuario = data.idUsuario;
        this.nombre = data.nombre;
        this.email = data.email;
        this.plan = data.modelo;
        this.saldo = data.saldo;
        this.deuda = data.deuda;

    }
}
