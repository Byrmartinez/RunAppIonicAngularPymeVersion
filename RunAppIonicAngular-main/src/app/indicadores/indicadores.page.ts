import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiRestService } from '../services/api-rest.service';
import { AutenthicationService } from '../services/autenthication.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-indicadores',
  templateUrl: './indicadores.page.html',
  styleUrls: ['./indicadores.page.scss'],
})
export class IndicadoresPage implements OnInit {
  envios: any[] = [];
  enviospyme: any[] = [];
  mostrarMenu = false;

  constructor(
    private router: Router,
    private api: ApiRestService,
    private autenthicationService: AutenthicationService
  ) {}

  async ngOnInit() {
    this.cargarEnvios();
  }

  cargarEnvios() {
    this.api.getEnvios().subscribe(
      (res: any[]) => {
        const cookieValue = document.cookie.split('; ').find(row => row.startsWith('idEmp='))?.split('=')[1];
        this.envios = res.filter(envio => envio.usuarioId === cookieValue);
        this.enviospyme = this.envios;
        this.renderCharts();
      },
      error => console.log(error)
    );
  }

  renderCharts() {
    this.renderEstadoChart();
    this.renderTipoEnvioChart();
    this.renderDistanciaChart();
  }

  renderEstadoChart() {
    const ctx = document.getElementById('estadoChart') as HTMLCanvasElement;
    const estados = [...new Set(this.envios.map(e => e.estado))];
    const counts = estados.map(estado => this.envios.filter(e => e.estado === estado).length);

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: estados,
        datasets: [
          {
            data: counts,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Estados de los Envíos',
          },
        },
      },
    });
  }

  renderTipoEnvioChart() {
    const ctx = document.getElementById('tipoEnvioChart') as HTMLCanvasElement;
    const tipos = [...new Set(this.envios.map(e => e.tipoEnvio))];
    const counts = tipos.map(tipo => this.envios.filter(e => e.tipoEnvio === tipo).length);

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: tipos,
        datasets: [
          {
            data: counts,
            backgroundColor: ['#4BC0C0', '#FF9F40', '#9966FF'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Tipos de Envíos',
          },
        },
      },
    });
  }

  renderDistanciaChart() {
    const ctx = document.getElementById('distanciaChart') as HTMLCanvasElement;
    const categorias = ['< 5km', '5-10km', '> 10km'];
    const counts = [
      this.envios.filter(e => e.distanciaKM < 5).length,
      this.envios.filter(e => e.distanciaKM >= 5 && e.distanciaKM <= 10).length,
      this.envios.filter(e => e.distanciaKM > 10).length,
    ];

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categorias,
        datasets: [
          {
            data: counts,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distancia de los Envíos',
          },
        },
      },
    });
  }


  doRefresh(event: any) {
    this.cargarEnvios();
    event.target.complete();
  }

  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  navigate(page: string) {
    this.router.navigate([`/${page}`]);
  }

  logout() {
    this.autenthicationService.logout();
  }
}
