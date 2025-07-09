import { Component, OnInit, ViewEncapsulation, ViewChild, Injectable } from '@angular/core';
import { IAPICore, ApiService } from '@core/services/apicore/api.service';
import jwt_decode from "jwt-decode";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { environment } from 'environments/environment';
import { MilitaryData, MilitaryDataUpdate, QRData } from 'app/main/services/military.service';
import { MilitaryUpdateService } from 'app/main/services/military-update-service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UtilService } from '@core/services/util/util.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Alergia, Enfermedad, Tratamiento } from 'app/main/services/militar.model';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };


  public ListaQRMilitar = []
  public tempData = [];
  public rowData = [];

  public selected = [];
  public basicSelectedOption: number = 10;
  public ColumnMode = ColumnMode;
  public SelectionType = SelectionType;

  public title_modal: string;

  public alergias: Alergia[] = [];
  public enfermedades: Enfermedad[] = [];
  public tratamientos: Tratamiento[] = [];

  public listadoQR: QRData = {
    cedula: '',
    hash: '',
    status: 0,
    fecha: new Date()
  };

  public correoForm: FormGroup;
  public telefonoForm: FormGroup;
  public fisionomiaForm: FormGroup;
  public datoPersonalesForm: FormGroup;
  public alergiasForm: FormGroup;
  public enfermedadesForm: FormGroup;
  public tratamientoForm: FormGroup;
  private phonePattern = /^\(\d{4}\)-\d{3}-\d{4}$/;

  public showAddButton: boolean = false;

  public loading: boolean = false;
  public totalRecords: number = 0;


  public loadingE: boolean = false;
  public totalRecordsE: number = 0;

  public loadingT: boolean = false;
  public totalRecordsT: number = 0;

  public title: string;
  public token;
  public imageBase64: string;
  public militarData: MilitaryData; // Variable para almacenar los datos del militar

  constructor(
    private _apiService: ApiService,
    private militaryUpdateService: MilitaryUpdateService,
    private fb: FormBuilder,
    private utilservice: UtilService,
    private modalService: NgbModal,
  ) { }

  async ngOnInit() {
    const tokenString = sessionStorage.getItem('token');
    if (tokenString) {
      this.token = jwt_decode(tokenString);
      await this.listQr(this.token.Usuario[0].cedula)
    }

    // para agregar nuevo TIM
    this.listadoQR.cedula = this.token.Usuario[0].cedula
    this.listadoQR.hash = this.token.Usuario[0].hash
    this.listadoQR.status = 0
    this.listadoQR.fecha = new Date();


    this.correoForm = this.fb.group({
      emailPrincipal: ['', [Validators.required, Validators.email]],
      emailSecundario: ['', Validators.email],
      emailInstitucional: ['', Validators.email]
    });

    this.datoPersonalesForm = this.fb.group({
      unidadsuperior: ['', [Validators.required,]],
      unidadorigen: ['', [Validators.required,]],
      religion: ['', [Validators.required,]]
    });

    this.telefonoForm = this.fb.group({
      movil: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      emergencia: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      domiciliario: ['', [Validators.pattern(this.phonePattern)]]
    });

    this.alergiasForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    this.enfermedadesForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });

    this.tratamientoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required]
    });


    this.fisionomiaForm = this.fb.group({
      gruposanguineo: ['', Validators.required],
      senaparticular: [''],
      colorcabello: ['', Validators.required],
      colorojos: ['', Validators.required],
      colorpiel: ['', Validators.required],
      estatura: [null, [Validators.required, Validators.min(1.20), Validators.max(2.50)]]
    });

    this.getMilitaryData(); // Llamamos al método para obtener los datos del militar

  }


  formatearTelefono(fieldName: string) {
    const field = this.telefonoForm.get(fieldName);
    let value = field?.value.replace(/\D/g, ''); // Elimina todo excepto números

    if (value) {
      value = value.replace(/(\d{4})(\d{3})(\d{4})/, '($1)-$2-$3');
      field?.setValue(value, { emitEvent: false });
    }
  }


  async listQr(cedula: any) {
    this.xAPI.funcion = environment.xApi.PIM_R_OBTENERLISTAQR;
    this.xAPI.parametros = `${cedula}`
    this.ListaQRMilitar = []
    await this._apiService.Ejecutar(this.xAPI).subscribe(
      (data) => {
        this.rowData = data;
        this.tempData = this.rowData;
      },
      (error) => {
        console.log(error)
      }
    )
  }

  ModalAddLista() {
    Swal.fire({
      title: "¿Está seguro que desea generar una nueva tarjeta de identificación?",
      text: "Esta acción creará una nueva credencial oficial con los datos actuales del usuario. Por favor verifique que la información esté correcta antes de continuar.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, generar tarjeta",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.militaryUpdateService.crearTIMMilitar(this.listadoQR)
          .then(async (data) => {
            this.ListaQRMilitar = []
            await this.listQr(this.token.Usuario[0].cedula)
            Swal.fire({
              title: "¡Tarjeta generada!",
              text: "La nueva tarjeta de identificación ha sido creada exitosamente.",
              icon: "success"
            });
          })
          .catch((error) => {
            // console.error(error);
            Swal.fire({
              title: "¡Ooops Lo Sentimos!",
              text: "Debe primero actualziar su información personal!",
              icon: "error"
            });
          });
      }
    });
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
        this.datoPersonalesForm.patchValue({
          unidadsuperior: this.militarData.unidadsuperior || '',
          unidadorigen: this.militarData.unidadorigen || '',
          religion: this.militarData.persona.religion || ''
        });

        this.loading = true
        this.alergias = this.militarData.persona.salud.alergias || [];
        this.totalRecords = this.alergias.length;
        this.loading = false

        this.loadingE = true
        this.enfermedades = this.militarData.persona.salud.enfermedades || [];
        this.totalRecordsE = this.enfermedades.length;
        this.loadingE = false


        this.loadingT = true
        this.tratamientos = this.militarData.persona.salud.tratamientos || [];
        this.totalRecordsT = this.tratamientos.length;
        this.loadingT = false

      })
      .catch(error => {
        console.error('Error al consultar datos del militar:', error);
      });

  }


  filterUpdate(event: any) {
    const val = event.target.value;
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.fecha.indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rowData = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  agregarAlergias() {
    const add = {
      cedula: this.token.Usuario[0].cedula,
      persona: {
        salud: {
          alergias: [
            {
              nombre: this.alergiasForm.get('nombre').value,
              descripcion: this.alergiasForm.get('descripcion').value
            }
          ]
        }
      }
    };

    this.militaryUpdateService.updateMilitaryData(this.token.Usuario[0].cedula, add)
      .then(async response => {
        await this.getMilitaryData();
        this.modalService.dismissAll();
        this.alergiasForm.reset();
        console.log('Actualización exitosa:', response);
        this.utilservice.AlertMini('top-end', 'success', 'Alergia Agregada!', 3000);
      })
      .catch(error => {
        console.error('Error en actualización:', error);
        this.utilservice.AlertMini('top-end', 'error', 'Oops! Lo sentimos, ocurrio un error', 3000);
      });
  }

  agregarEnfermedades() {
    const add = {
      cedula: this.token.Usuario[0].cedula,
      persona: {
        salud: {
          enfermedades: [
            {
              nombre: this.enfermedadesForm.get('nombre').value,
              descripcion: this.enfermedadesForm.get('descripcion').value
            }
          ]
        }
      }
    };

    this.militaryUpdateService.updateMilitaryData(this.token.Usuario[0].cedula, add)
      .then(async response => {
        await this.getMilitaryData();
        this.modalService.dismissAll();
        this.enfermedadesForm.reset();
        console.log('Actualización exitosa:', response);
        this.utilservice.AlertMini('top-end', 'success', 'Enfermedad Agregada!', 3000);
      })
      .catch(error => {
        console.error('Error en actualización:', error);
        this.utilservice.AlertMini('top-end', 'error', 'Oops! Lo sentimos, ocurrio un error', 3000);
      });
  }

  agregarTratamiento() {
    const add = {
      cedula: this.token.Usuario[0].cedula,
      persona: {
        salud: {
          tratamientos: [
            {
              nombre: this.tratamientoForm.get('nombre').value,
              descripcion: this.tratamientoForm.get('descripcion').value
            }
          ]
        }
      }
    };

    this.militaryUpdateService.updateMilitaryData(this.token.Usuario[0].cedula, add)
      .then(async response => {
        await this.getMilitaryData();
        this.modalService.dismissAll();
        this.tratamientoForm.reset();
        console.log('Actualización exitosa:', response);
        this.utilservice.AlertMini('top-end', 'success', 'Tratamiento Agregado!', 3000);
      })
      .catch(error => {
        console.error('Error en actualización:', error);
        this.utilservice.AlertMini('top-end', 'error', 'Oops! Lo sentimos, ocurrio un error', 3000);
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
        this.utilservice.AlertMini('top-end', 'success', 'Correos Actualizados!', 3000);
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

  actualizarDatosPersonales() {
    const updates = {
      cedula: this.token.Usuario[0].cedula,
      persona: {
        religion: this.datoPersonalesForm.get('religion').value,
      },
      unidadsuperior: this.datoPersonalesForm.get('unidadsuperior').value,
      unidadorigen: this.datoPersonalesForm.get('unidadorigen').value
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


  openModal(modal, row) {
    this.title_modal = !row ? 'Ingresar Alergias' : 'Actualizar Alergias';
    if (row) {
      this.alergiasForm.patchValue({
        nombre: row.nombre,
        descripcion: row.descripcion
      });
    }
    this.showAddButton = true;
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  openModalEnfermedades(modal, row) {
    this.title_modal = !row ? 'Ingresar Enfermedades' : 'Actualizar Enfermedades';
    if (row) {
      this.enfermedadesForm.patchValue({
        nombre: row.nombre,
        descripcion: row.descripcion
      });
    }
    this.showAddButton = true;
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  openModalTratamiento(modal, row) {
    this.title_modal = !row ? 'Ingresar Tratamientos' : 'Actualizar Tratamientos';
    if (row) {
      this.tratamientoForm.patchValue({
        nombre: row.nombre,
        descripcion: row.descripcion
      });
    }
    this.showAddButton = true;
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
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