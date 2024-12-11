import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ApiRestService } from '../services/api-rest.service';
import { Envio } from '../models/envio.model';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-home-emp',
  templateUrl: './home-emp.page.html',
  styleUrls: ['./home-emp.page.scss'],
})
export class HomeEmpPage implements OnInit, OnDestroy {

  private refreshInterval: any;
  private routeSub: Subscription | undefined;
  mostrarMenu = false;
  envios: Envio[] = [];
  envio: any;
  id: any;
  enviospyme: Envio[] = [];
  empId: any;

  constructor(private router: Router, private api: ApiRestService, private cookieService: CookieService) { }

  async ngOnInit() { 

    this.iniciarCargaDeEnvios();
    const hiddenAncestor = document.querySelector('[aria-hidden="true"]');
    if (hiddenAncestor) {
      hiddenAncestor.removeAttribute('aria-hidden');
    }
    this.routeSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Verifica si la ruta actual es la de envíos
        if (this.router.url === '/home-emp') {
          this.iniciarCargaDeEnvios();
        } else {
          this.detenerCargaDeEnvios();
        }
      }
    });


    this.cargarEnvios();
    
  }

  cargarEnvios() {
    this.api.getEnvios().subscribe((res: any[]) => {
      this.envios = res.map(data => new Envio(data));
      let cookieValue = this.cookieService.get('idEmp');
      this.empId = this.cookieService.get('idEmp');
      this.enviospyme = this.envios.filter(envio => envio.usuarioId == this.empId);
    }, (error) => {
      console.log(error);
    });
  }

  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    this.detenerCargaDeEnvios();
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
  iniciarCargaDeEnvios(): void {
    this.cargarEnvios();
    console.log('cargandoweas') // Carga inicial
    if (!this.refreshInterval) {
      this.refreshInterval = setInterval(() => {
        this.cargarEnvios();
      }, 5000);
    }
  }

  detenerCargaDeEnvios(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
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
    this.mostrarMenu = !this.mostrarMenu;
  }

  irACrearEnvio() {
    this.router.navigate(['/shipment']);
  }

  navigate(route: string) {
    this.router.navigate([`/${route}`]);
  }

  cerrarSesion() {
    console.log('Sesión cerrada');
    this.router.navigate(['/login']);
  }
}
