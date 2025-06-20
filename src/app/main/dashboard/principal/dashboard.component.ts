import { Component, OnInit, ViewEncapsulation, ViewChild, Injectable } from '@angular/core';
import { IAPICore, ApiService } from '@core/services/apicore/api.service';
import jwt_decode from "jwt-decode";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { environment } from 'environments/environment';
import { MilitaryData, MilitaryDataUpdate } from 'app/main/services/military.service';
import { MilitaryUpdateService } from 'app/main/services/military-update-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilService } from '@core/services/util/util.service';

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

  correoForm: FormGroup;
  telefonoForm: FormGroup;
  fisionomiaForm: FormGroup;
  private phonePattern = /^\(\d{4}\)-\d{3}-\d{4}$/;

  public title: string;
  public token;
  public imageBase64: string;
  public militarData: MilitaryData; // Variable para almacenar los datos del militar

  constructor(
    private _apiService: ApiService,
    private militaryUpdateService: MilitaryUpdateService,
    private fb: FormBuilder,
    private utilservice: UtilService
  ) { }

  async ngOnInit() {
    const tokenString = sessionStorage.getItem('token');
    if (tokenString) {
      this.token = jwt_decode(tokenString);
    }

    this.correoForm = this.fb.group({
      emailPrincipal: ['', [Validators.required, Validators.email]],
      emailSecundario: ['', Validators.email],
      emailInstitucional: ['', Validators.email]
    });

    this.telefonoForm = this.fb.group({
      movil: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      emergencia: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      domiciliario: ['', [Validators.pattern(this.phonePattern)]]
    });

    this.fisionomiaForm = this.fb.group({
      gruposanguineo: ['', Validators.required],
      senaparticular: [''],
      colorcabello: ['', Validators.required],
      colorojos: ['', Validators.required],
      colorpiel: ['', Validators.required],
      estatura: [null, [Validators.required, Validators.min(1.20), Validators.max(2.50)]]
    });


    await this.getMilitaryData(); // Llamamos al método para obtener los datos del militar

  }


  formatearTelefono(fieldName: string) {
    const field = this.telefonoForm.get(fieldName);
    let value = field?.value.replace(/\D/g, ''); // Elimina todo excepto números

    if (value) {
      value = value.replace(/(\d{4})(\d{3})(\d{4})/, '($1)-$2-$3');
      field?.setValue(value, { emitEvent: false });
    }
  }


  async getMilitaryData() {
    await this.militaryUpdateService.ConsultarMilitar(this.token.Usuario[0].cedula)
      .then((data: MilitaryData) => {
        this.militarData = data; // Asignamos los datos del militar a la variable
        this.correoForm.patchValue({
          emailPrincipal: this.militarData.persona.correo.principal || '',
          emailSecundario: this.militarData.persona.correo.alternativo || '',
          emailInstitucional: this.militarData.persona.correo.institucional || ''
        });
        this.telefonoForm.patchValue({
          movil: this.militarData.persona.telefono.movil || '',
          emergencia: this.militarData.persona.telefono.emergencia || '',
          domiciliario: this.militarData.persona.telefono.domiciliario || ''
        });
        this.fisionomiaForm.patchValue({
          gruposanguineo: this.militarData.persona.datofisionomico.gruposanguineo || '',
          senaparticular: this.militarData.persona.datofisionomico.senaparticular || '',
          colorcabello: this.militarData.persona.datofisionomico.colorcabello || '',
          colorojos: this.militarData.persona.datofisionomico.colorojos || '',
          colorpiel: this.militarData.persona.datofisionomico.colorpiel || '',
          estatura: this.militarData.persona.datofisionomico.estatura || null
        });
      })
      .catch(error => {
        console.error('Error al consultar datos del militar:', error);
      });

  }


  updateMilitaryEmail() {
    const updates = {
      cedula: this.token.Usuario[0].cedula,
      persona: {
        correo: {
          principal: this.correoForm.get('emailPrincipal').value,
          alternativo: this.correoForm.get('emailSecundario').value,
          institucional: this.correoForm.get('emailInstitucional').value
        }
      }
    };

    this.militaryUpdateService.updateMilitaryData(this.token.Usuario[0].cedula, updates)
      .then(async response => {
        await this.getMilitaryData();
        console.log('Actualización exitosa:', response);
        this.utilservice.AlertMini('top-end', 'success', 'Datos Actualizados!', 3000);
      })
      .catch(error => {
        console.error('Error en actualización:', error);
        this.utilservice.AlertMini('top-end', 'error', 'Oops! Lo sentimos, ocurrio un error', 3000);
      });
  }

  updateMilitaryPhone() {
    if (this.telefonoForm.valid) {
      // Mantenemos el formato exacto (0412)-712-2496
      const movil = this.telefonoForm.get('movil').value;
      const emergencia = this.telefonoForm.get('emergencia').value;
      const domiciliario = this.telefonoForm.get('domiciliario').value || null;

      const updates = {
        cedula: this.token.Usuario[0].cedula,
        persona: {
          telefono: {
            movil: movil,
            emergencia: emergencia,
            domiciliario: domiciliario
          }
        }
      };

      this.militaryUpdateService.updateMilitaryData(this.token.Usuario[0].cedula, updates)
        .then(async response => {
          await this.getMilitaryData();
          this.utilservice.AlertMini('top-end', 'success', 'Datos Actualizados!', 3000);
        })
        .catch(error => {
          // console.error('Error en actualización:', error);
          this.utilservice.AlertMini('top-end', 'error', 'Oops! Lo sentimos, ocurrió un error', 3000);
        });
    } else {
      this.utilservice.AlertMini('top-end', 'warning', 'Por favor complete correctamente los campos', 3000);
    }
  }

  actualizarDatosFisionomicos() {
  if (this.fisionomiaForm.valid) {
    const datos = {
      cedula: this.token.Usuario[0].cedula,
      persona: {
        datofisionomico: {
          gruposanguineo: this.fisionomiaForm.value.gruposanguineo,
          senaparticular: this.fisionomiaForm.value.senaparticular || 'NINGUNA',
          colorcabello: this.fisionomiaForm.value.colorcabello,
          colorojos: this.fisionomiaForm.value.colorojos,
          colorpiel: this.fisionomiaForm.value.colorpiel,
          estatura: parseFloat(this.fisionomiaForm.value.estatura)
        }
      }
    };

    this.militaryUpdateService.updateMilitaryData(this.token.Usuario[0].cedula, datos)
      .then(async response => {
        await this.getMilitaryData();
        this.utilservice.AlertMini('top-end', 'success', 'Datos fisonómicos actualizados!', 3000);
      })
      .catch(error => {
        console.error('Error actualizando datos fisonómicos:', error);
        this.utilservice.AlertMini('top-end', 'error', 'Error al actualizar datos', 3000);
      });
  }
}


  // Métodos existentes (sin cambios)
  async GenerarPIMQR() {
    const id = '50c68b8dbba2b01aade504fe643c3221fe3d9a9aeb049df4a225733166adbede';
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

  async DescargarQR() {
    await this._apiService.LoadQR('033cb52760a6f3e5971439f44cb287d77368e42346528f7a5edc99210d7649a3').subscribe(
      async (data) => {
        this.imageBase64 = data.contenido
        await this.downloadImage(this.imageBase64)
      },
      (error) => {
        console.log(error)
      }
    )
  }

  downloadImage(qr: string) {
    try {
      if (!qr.startsWith('data:image/png;base64,')) {
        console.error('Formato de imagen no válido');
        return;
      }

      const link = document.createElement('a');
      link.href = qr;
      link.download = 'imagen-descargada.png';

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