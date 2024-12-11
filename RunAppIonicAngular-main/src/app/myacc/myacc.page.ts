import { Component, OnInit } from '@angular/core'; // Importar OnInit
import { Router } from '@angular/router';
import { ApiRestService } from '../services/api-rest.service';
import { AutenthicationService } from '../services/autenthication.service';
import { Envio } from '../models/envio.model';
import { Usuario } from '../models/usuario.model';
import { DatosPyme } from 'src/app/models/datosPyme.model';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-myacc',
  templateUrl: './myacc.page.html',
  styleUrls: ['./myacc.page.scss'],
})
export class MyaccPage implements OnInit {
  envios: Envio[] = [];
  id: any;
  usuario: any;
  nombre: any;
  nombre_pyme:any;
  email: any;
  email_pyme:any;
  telefono: any;
  estado: any;
  fechaCreacion: any;
  datosPyme: any;
  saldo: any;
  deuda: any;
  plan:any;


  mostrarMenu = false; // Para controlar la visibilidad del menú
  constructor(private cookieService: CookieService, private router: Router, private api: ApiRestService, private autenthicationService: AutenthicationService) { }

  async ngOnInit() {

    let cookieValue = this.cookieService.get('idEmp');
    this.api.getUsuarioById(cookieValue).subscribe((res) => {
      //console.log("esta es la res de by id" + res)
      this.usuario = new Usuario(res);
      this.nombre = this.usuario.nombre
      this.email = this.usuario.email
      this.telefono = this.usuario.telefono
      this.estado = this.usuario.estado
      this.fechaCreacion = this.usuario.fechaCreacion

      //console.log("esta es la res de by id" + this.envio)
    }, (error: any) => {

    });
    this.api.getDatosPymesById(cookieValue).subscribe((res) => {
      //console.log("esta es la res de by id" + res)
      this.datosPyme = new DatosPyme(res);
      this.nombre_pyme = this.datosPyme.nombre;
      this.email_pyme = this.datosPyme.email;
      this.plan = this.datosPyme.modelo;
      this.saldo = this.datosPyme.saldo;
      this.deuda = this.datosPyme.deuda;

      //console.log("esta es la res de by id" + this.envio)
    }, (error: any) => {
    });
    this.api.getEnvios().subscribe((res: any[]) => {
      this.envios = res.map(data => new Envio(data));

    }, (error) => {

    });
  }

  doRefresh(event: any) {
    this.api.getEnvios().subscribe((res) => {
      this.envios = res;
      console.log(this.envios)
    }, (error) => {
      console.log(error);
    });
    console.log('Begin async operation');
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu; // Alterna el menú desplegable
  }

  navigate(page: string) {
    this.mostrarMenu = false; // Cierra el menú al navegar
    this.router.navigate([`/${page}`]);
  }

  logout() {
    this.autenthicationService.logout();
  }
}
