import { Component, OnInit, ViewEncapsulation, ViewChild, Injectable } from '@angular/core';
import { IAPICore, ApiService } from '@core/services/apicore/api.service';
import jwt_decode from "jwt-decode";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { environment } from 'environments/environment';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})

export class DashboardComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public token;
  public imageBase64 : string


  constructor(
    private _apiService: ApiService
  ) { }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  async ngOnInit() {

    const tokenString = sessionStorage.getItem('token');
    if (tokenString) {
      this.token = jwt_decode(tokenString);
    }

    console.log(this.token)


    this.ConsultarMilitar(this.token.Usuario[0].cedula)

    // await this.GenerarPIMQR()

  }

  async ConsultarMilitar(cedula: string) {
    this.xAPI.funcion = environment.xApi.OBTENERMILITAR;
    this.xAPI.parametros = `${cedula}`;

    return new Promise(async (resolve, reject) => {
      await this._apiService.EjecutarDev(this.xAPI).subscribe({
        next: (response: any) => {
          if (!response) {
            reject('La API respondió con null/undefined');
            return;
          }
          console.log('Datos:', response);
          resolve(response);
        },
        error: (err) => {
          console.error('Error en la API:', err);
          reject(err);
        }
      });
    });
  }

  async GenerarPIMQR(){
          const id = 'b826c8797a3eedfc6c30a4d5abac1eb5c16880b6cc08608d0067c640e5df25e9';
          let ruta: string = environment.rutaQR.pim_ejercito;
         await this._apiService.GenQR(id, ruta).subscribe(
            (data) => {
              console.log(data)
            },
            (error) => {
              console.log(error)
            }
          );
  }


  async DescargarQR(){
    await this._apiService.LoadQR('b826c8797a3eedfc6c30a4d5abac1eb5c16880b6cc08608d0067c640e5df25e9').subscribe(
                async (data) => {
                  this.imageBase64 = data.contenido
                  await this.downloadImage(this.imageBase64)
                },
                (error) => {
                  console.log(error)
                }
              )
  }


  downloadImage(qr:string) {
  try {
    // Verificar si la cadena base64 es válida
    if (!qr.startsWith('data:image/png;base64,')) {
      console.error('Formato de imagen no válido');
      return;
    }

    const link = document.createElement('a');
    link.href = qr;
    link.download = 'imagen-descargada.png';
    
    // Opcional: agregar fecha al nombre del archivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `PIMQREJB-${timestamp}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al descargar la imagen:', error);
  }
}

}
