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


    this.ConsultarMilitar(this.token.Usuario.cedula)

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


}
