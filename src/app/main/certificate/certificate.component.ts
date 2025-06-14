import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/apicore/api.service';
import { IAPICore } from '@core/services/apicore/api.service';
import { CoreConfigService } from '@core/services/config.service';
import { UtilService } from '@core/services/util/util.service';
import { environment } from 'environments/environment';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit {

  registroForm: FormGroup;
  openedAccordions: string[] = [];



  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public componente: string = '';
  public escudo: string = '';

  public errorMessage: string = '';
  public showErrorCard: boolean = false;
  public isLoading: boolean = true;

  public cedula
  public rowMilitar

  public militar = {
    foto: '',
    grado: '',
    componente: '',
    nombre: '',
    apellido: '',
    cedula: '',
    fechaNacimiento: '',
    unidadSuperior: '',
    unidadOrigen: '',
    telefono: '',
    telefonoEmergencia: '',
    religion: '',
    grupoSanguineo: '',
    salud: undefined,
    escudo: ''
  }

  constructor(
    private _coreConfigService: CoreConfigService,
    private _apiService: ApiService,
    private route: ActivatedRoute,
    private utilService: UtilService
  ) {
    this._coreConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        menu: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        customizer: false,
        enableLocalStorage: false
      }
    };
  }

  async ngOnInit() {

    this.route.url.pipe(
      filter(segments => segments.length > 0),
      map(segments => segments[segments.length - 1].path)
    ).subscribe(lastParam => {
      this.cedula = lastParam
    });
    await this.consultarHashMilitar(this.cedula)

  }

  noArrastrar(event: DragEvent) {
    event.preventDefault();
  }

  toggleAccordion(id: string) {
    if (this.isAccordionOpen(id)) {
      this.openedAccordions = this.openedAccordions.filter(item => item !== id);
    } else {
      this.openedAccordions.push(id);
    }
  }

  isAccordionOpen(id: string): boolean {
    return this.openedAccordions.includes(id);
  }


async consultarHashMilitar(hash: string) {
    this.isLoading = true;
    this.showErrorCard = false;
    this.xAPI.funcion = environment.xApi.CONSULTARHASH;
    this.xAPI.parametros = `${hash}`;
    
    // console.log('Consultando hash:', hash);

    return new Promise(async (resolve, reject) => {
      await this._apiService.EjecutarDev(this.xAPI).subscribe({
        next: async (response: any) => {
          if (!response) {
            this.errorMessage = 'La API respondió con null/undefined';
            this.showErrorCard = true;
            this.isLoading = false;
            reject(this.errorMessage);
            return;
          }

          if (!Array.isArray(response) || response.length === 0) {
            this.errorMessage = 'El hash no existe o no tiene datos asociados';
            this.showErrorCard = true;
            this.isLoading = false;
            reject(this.errorMessage);
            return;
          }

          if (!response[0].cedula) {
            this.errorMessage = 'El hash no contiene cédula válida';
            this.showErrorCard = true;
            this.isLoading = false;
            reject(this.errorMessage);
            return;
          }

          // console.log('Hash válido encontrado para cédula:', response[0].cedula);
          try {
            await this.ConsultarMilitar(response[0].cedula);
            this.isLoading = false;
            resolve(response);
          } catch (error) {
            this.errorMessage = 'Error al consultar datos del militar';
            this.showErrorCard = true;
            this.isLoading = false;
            reject(error);
          }
        },
        error: (err) => {
          this.errorMessage = 'Error en la conexión con el servidor';
          this.showErrorCard = true;
          this.isLoading = false;
          // console.error('Error en la petición del hash:', {
          //   hash: hash,
          //   error: err,
          //   timestamp: new Date().toISOString()
          // });
          reject(err);
        }
      });
    });
  }


  async ConsultarMilitar(cedula: string) {
    this.xAPI.funcion = environment.xApi.OBTENERMILITAR;
    this.xAPI.parametros = `${cedula}`;

    return new Promise(async (resolve, reject) => {
      this._apiService.EjecutarDev(this.xAPI).subscribe({
        next: async (response: any) => {
          if (!response || !response[0] || !response[0].cedula) {
          // console.log('Hash no válido o no se encontraron datos');
          reject('Hash no válido');
          return;
        }
          this.rowMilitar = response[0];
          this.militar = {
            foto: `https://app.ipsfa.gob.ve/sssifanb/afiliacion/temp/${this.rowMilitar.cedula}/foto.jpg`,
            grado: this.rowMilitar.grado.descripcion,
            componente: this.rowMilitar.componente.descripcion,
            nombre: this.rowMilitar.persona.datobasico.nombreprimero,
            apellido: this.rowMilitar.persona.datobasico.apellidoprimero,
            cedula: this.rowMilitar.cedula,
            fechaNacimiento: '',
            unidadSuperior: '',
            unidadOrigen: '',
            telefono: this.rowMilitar.persona.telefono.movil,
            telefonoEmergencia: this.rowMilitar.persona.telefono.emergencia ? this.rowMilitar.persona.telefono.emergencia : this.rowMilitar.persona.telefono.domiciliario,
            religion: this.rowMilitar.persona.religion,
            grupoSanguineo: this.rowMilitar.persona.datofisionomico.gruposanguineo,
            salud: this.rowMilitar.persona.salud,
            escudo: ''
          };
          switch (this.rowMilitar.componente.abreviatura) {
            case 'EJ':
              // this.componente = this.rowMilitar.componente.descripcion
              this.escudo = './assets/images/componentes/EJ.webp';
              break;
            case 'AR':
              // this.componente = this.rowMilitar.componente.descripcion
              this.escudo = './assets/images/componentes/AR.webp';
              break;
            case 'AV':
              // this.componente = this.rowMilitar.componente.descripcion
              this.escudo = './assets/images/componentes/AV.webp';
              break;
            case 'GNB':
              // this.componente = this.rowMilitar.componente.descripcion
              this.escudo = './assets/images/componentes/GN.webp';
              break;
            case 'Milicia':
              // this.componente = this.rowMilitar.componente.descripcion
              this.escudo = './assets/images/componentes/MB.webp';
              break;
            default:
              this.componente = '';
              break;
          }

        resolve(response);
        await this.ConsultarMilitar(response[0].cedula);


        },
        error: (err) => {
          console.error('Error en la API:', err);
          reject(err);
        }
      });
    });
  }

}
