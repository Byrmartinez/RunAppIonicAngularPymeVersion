import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { AlertController } from '@ionic/angular';
import { ApiRestService } from '../services/api-rest.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

declare var google: any;
declare var marker: any;


@Component({
  selector: 'app-shipment',
  templateUrl: './shipment.page.html',
  styleUrls: ['./shipment.page.scss'],
})
export class ShipmentPage implements AfterViewInit, OnInit {
  private refreshInterval: any;
  body = {};
  map: any;
  autocomplete: any;
  autocomplete2: any;
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  direccionOrigen: string = '';
  direccionOrigen2: any;
  direccionDestino: string = '';
  direccionDestino2: any;

  currentPosition: any;
  mostrarMapa: boolean = false;
  distanciaFinal: any; // Para controlar la visibilidad del mapa

  userId: any;
  riderId: string = "";
  contador: number = 0;
  //direccionOrigen
  //direccionDestino
  descripcion: string = "";
  //distanciaKm = distanciaFinal
  estado: string = "pendiente";
  tipo_envio: string = "";
  costoSugerido: number = 0;
  costo: number = 0;
  comision_aplicacion: number = 0;
  comision_rider: number = 0;
  valorFinal: number = 0;


  constructor(private router: Router, private alertController: AlertController, private cookieService: CookieService, private api: ApiRestService) { }
  ngOnInit(): void {
    this.refreshInterval = setInterval(() => {
      this.updateComisiones();
    }, 1000);
  }
  ngAfterViewInit() {
    // Inicializar autocompletado solo para el destino
    this.initializeAutocomplete(); // Inicializar autocompletado solo para el destino
    let cookieValue = this.cookieService.get('idEmp');
    this.userId = this.cookieService.get('idEmp');

  }
  updateComisiones() {
    this.comision_aplicacion = Math.round(this.costoSugerido * 0.20);
    this.comision_rider = Math.round(this.costoSugerido * 0.10);
    this.valorFinal = Math.round(this.costoSugerido - this.comision_aplicacion - this.comision_rider);
  }

  
  // Método unificado para inicializar el autocompletado para ambos campos
  initializeAutocomplete() {
    const inputOrigen = document.getElementById('origin-input') as HTMLInputElement;
    const inputDestino = document.getElementById('destination-input') as HTMLInputElement;

    // Autocompletado para el origen
    this.autocomplete = new google.maps.places.Autocomplete(inputOrigen, {
      componentRestrictions: { country: 'CL' }
    });

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        this.direccionOrigen = place.formatted_address;
        this.direccionOrigen2 = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        console.log('Dirección de origen:', this.direccionOrigen);
        console.log('Coordenadas de origen:', this.direccionOrigen2);
      } else {
        alert('No se pudo determinar la ubicación del origen.');
      }
    });

    // Autocompletado para el destino
    this.autocomplete2 = new google.maps.places.Autocomplete(inputDestino, {
      componentRestrictions: { country: 'CL' }
    });

    this.autocomplete2.addListener('place_changed', () => {
      const place = this.autocomplete2.getPlace();
      if (place.geometry && place.geometry.location) {
        this.direccionDestino = place.formatted_address;
        this.direccionDestino2 = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        console.log('Dirección de destino:', this.direccionDestino);
        console.log('Coordenadas de destino:', this.direccionDestino2);

        if (this.direccionOrigen2 && this.direccionDestino2) {
          this.mostrarMapa = true;
          this.renderizarMapa(this.direccionOrigen2, this.direccionDestino2);
        }
      } else {
        alert('No se pudo determinar la ubicación del destino.');
      }
    });
  }

  // Método para renderizar el mapa con los marcadores de origen y destino
  renderizarMapa(origin: any, destination: any) {
    const mapOptions = {
      center: origin, // Usar la coordenada de origen para centrar el mapa
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    this.directionsRenderer.setMap(this.map);

    // Crear marcador para la ubicación de origen
    const markerOrigen = new google.maps.Marker({
      position: origin,
      map: this.map,
      title: 'Ubicación de Origen'
    });

    // Crear marcador para la ubicación de destino
    const markerDestino = new google.maps.Marker({
      position: destination,
      map: this.map,
      title: 'Ubicación de Destino'
    });

    this.calcularRuta(origin, destination);
  }

  // Método para calcular la ruta entre el origen y el destino
  calcularRuta(origin: any, destination: any) {
    const request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
        const route = result.routes[0];
        const legs = route.legs[0]; // Considerando que hay una sola ruta y un solo tramo
        const distanceInMeters = legs.distance.value; // Distancia en metros
        const distanceInKilometers = distanceInMeters / 1000; // Convertir a kilómetros
        this.distanciaFinal = distanceInKilometers;
        console.log(`La distancia es: ${distanceInKilometers} km`);
        const tarifaBase = 1300;
        const costoPorKM = 500;
        const calculoCostoSugerido = Math.round(tarifaBase + (costoPorKM * this.distanciaFinal));
        this.costoSugerido = calculoCostoSugerido;
        this.costo = calculoCostoSugerido; //
      } else {
        console.error('Error al calcular la ruta:', status);
        this.mostrarAlerta('Error', 'No se pudo calcular la ruta.');
      }
    });
  }

  // Método para usar la ubicación actual como origen
  async usarUbicacionActual() {
    try {
      const position = await Geolocation.getCurrentPosition();
      this.currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      this.direccionOrigen = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`; // Rellenar el campo de origen con las coordenadas
      console.log(`Ubicación actual: ${position.coords.latitude}, ${position.coords.longitude}`);
      if (this.direccionDestino) {

        this.renderizarMapa(this.direccionOrigen, this.direccionDestino2); // Mostrar mapa cuando ambos campos estén llenos
      }
    } catch (error) {
      console.error('Error obteniendo la ubicación:', error);
      await this.mostrarAlerta('Error', 'No se pudo obtener la ubicación actual.');
    }
  }

  // Método para mostrar alertas
  async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // Método para crear el envío
  async crearEnvio() {
    if (this.camposVacios()) {
      this.presentAlert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    this.body = {
      usuarioId: this.userId, riderId: "", contador: this.contador, direccionOrigen: this.direccionOrigen,
      direccionDestino: this.direccionDestino, descripcion: this.descripcion, distanciaKM: this.distanciaFinal,
      estado: this.estado, tipoEnvio: this.tipo_envio, costo: this.costo, comisionAplicacion: this.comision_aplicacion,
      comisionRider: this.comision_rider, valorFinal: this.valorFinal
    };
    this.api.createEnvio(this.body).subscribe((success) => {
      console.log(success);
      this.presentAlert('Exito', 'Envio Creado.');
      this.router.navigate([`home-emp`]);

    }, (error) => {
      console.log(error);
    });
  }
  // Métodos auxiliares
  private camposVacios(): boolean {
    return (
      this.direccionOrigen.trim() === '' ||
      this.direccionDestino.trim() === '' ||
      this.descripcion.trim() === '' ||
      this.tipo_envio.trim() === '' ||
      this.costo === 0

    );
  }
  // Método para mostrar alertas
  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }

}