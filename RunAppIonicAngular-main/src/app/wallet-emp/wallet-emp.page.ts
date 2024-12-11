import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiRestService } from '../services/api-rest.service';
import { AutenthicationService } from '../services/autenthication.service';
import { CookieService } from 'ngx-cookie-service';
import { Envio } from '../models/envio.model';

@Component({
  selector: 'app-wallet-emp',
  templateUrl: './wallet-emp.page.html',
  styleUrls: ['./wallet-emp.page.scss'],
})
export class WalletEmpPage implements OnInit {
  // Variables
  mostrarMenu = false;
  envios: Envio[] = [];
  enviospyme: Envio[] = [];
  empId: string | null = null;

  // Contadores por estado
  totalPendientes: number = 0;
  totalAceptados: number = 0;
  totalEnCamino: number = 0;
  totalEntregados: number = 0;
  totalCancelados: number = 0;  // Contador de cancelados
  totalPedidosEnDinero: number = 0; // Suma de "valorFinal" de todos los pedidos

  constructor(
    private router: Router,
    private api: ApiRestService,
    private autenthicationService: AutenthicationService,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.cargarEnvios();
  }

  cargarEnvios() {
    // Recuperar ID de la empresa desde la cookie
    this.empId = this.cookieService.get('idEmp');
    if (!this.empId) {
      console.error('No se encontró el ID de la empresa en las cookies.');
      return;
    }

    

    // Llamar a la API para obtener los envíos
    this.api.getEnvios().subscribe(
      (res: any[]) => {
        this.envios = res.map((data) => new Envio(data));
        this.enviospyme = this.envios.filter((envio) => envio.usuarioId === this.empId);

        // Calcular estadísticas
        this.calcularEstadisticas();
      },
      (error) => {
        console.error('Error al cargar envíos:', error);
      }
    );
  }

  calcularEstadisticas() {
    // Inicializar contadores
    this.totalPendientes = 0;
    this.totalAceptados = 0;
    this.totalEnCamino = 0;
    this.totalEntregados = 0;
    this.totalCancelados = 0;  // Inicializar contador de cancelados
    this.totalPedidosEnDinero = 0;

    // Contar envíos por estado y sumar valores finales
    this.enviospyme.forEach((envio) => {
      switch (envio.estado) {
        case 'pendiente':
          this.totalPendientes++;
          break;
        case 'aceptado':
          this.totalAceptados++;
          break;
        case 'encamino':
          this.totalEnCamino++;
          break;
        case 'entregado':
          this.totalEntregados++;
          break;
        case 'cancelado':
          this.totalCancelados++;  // Contar los cancelados
          break;
      }

      // Sumar "valorFinal" solo si el estado no es cancelado
      if (envio.estado !== 'cancelado') {
        this.totalPedidosEnDinero += parseFloat(envio.valorFinal.toString()); // Asegúrate de convertirlo a string y luego a número
      } 
      
    });
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
