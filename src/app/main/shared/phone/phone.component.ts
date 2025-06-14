import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ApiService, IAPICore } from '@core/services/apicore/api.service';
import { UtilService } from '@core/services/util/util.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import jwt_decode from "jwt-decode";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.scss']
})
export class PhoneComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;

  @BlockUI() blockUI: NgBlockUI;
  @BlockUI('section-block') sectionBlockUI: NgBlockUI;


  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };


  public basicSelectedOption: number = 10;
  public isLoading: number = 0;
  public selectedOption = 10;
  public ColumnMode = ColumnMode;
  public selected = [];
  public searchValue = '';
  public title_modal
  public SelectionType = SelectionType;
  public token
  public rows
  public tempData = []
  public list = []
  public idUser : number = 0


  public IPhone = {
    id: 0,
    id_user: 0,
    phone: '',
    type: undefined,
    status: undefined,
  }

  public statusOptions = [
    { id: 1, name: 'Activo' },
    { id: 0, name: 'Inactivo' }
  ];

  public typePhone = [
    { id: 1, name: 'Personal' },
    { id: 2, name: 'Emergencia' },
  ];

  public showAddButton: boolean = true;



  constructor(
    private apiService: ApiService,
    private utilService: UtilService,
    private modalService: NgbModal,
    private datePipe: DatePipe,
  ) { }

  async ngOnInit() {
    this.token = jwt_decode(sessionStorage.getItem('token'));
    this.idUser = this.token.Usuario[0].id
    await this.ListarGet();
  }


  async ListarGet() {
    this.isLoading = 0;
    this.list = []; // Clear previous data
    this.rows = []
    this.xAPI.funcion = environment.xApi.PHONE.list;
    this.xAPI.parametros = `${this.idUser}`;
    this.xAPI.valores = '';

    try {
      const data = await this.apiService.Ejecutar(this.xAPI).toPromise();

      if (data?.Cuerpo?.length > 0) {
        this.list = data.Cuerpo; // Use spread operator for cleaner array copy
        this.isLoading = 1;
        this.rows = this.list;
        this.tempData = this.rows;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (this.list.length === 0) {
        this.isLoading = 2; // Indicate no data found
      }
    }
  }

  getTypeName(typeId: number): string {
    const type = this.typePhone.find(t => t.id === typeId);
    return type ? type.name : 'Desconocido'; // Devuelve 'Desconocido' si no encuentra el tipo
  }

  filterUpdate(event) {
    // Reset ng-select on search
    const val = event.target.value.toLowerCase();
    // Filter Our Data
    const temp = this.tempData.filter(function (d) {
      return d.phone.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // Update The Rows
    this.rows = temp;
    // Whenever The Filter Changes, Always Go Back To The First Page
    this.table.offset = 0;
  }

async Eliminar({ id }: { id: string | number }) {
  const confirmacion = await Swal.fire({
    title: '¿Está seguro?',
    text: '¡De eliminar este registro!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminarlo!',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmacion.isConfirmed) return;

  try {
    this.xAPI.funcion = environment.xApi.PHONE.delete;
    this.xAPI.parametros = `${id},${this.idUser.toString()}`;
    this.xAPI.valores = {};
    
    const data = await this.apiService.Ejecutar(this.xAPI).toPromise();
    
    this.rows = []
    this.ListarGet();
    
    if (data.tipo === 1) {
      this.utilService.AlertMini('top-end', 'success', 'Telefono eliminado exitosamente', 3000);
      await this.ListarGet();
    } else {
      this.utilService.AlertMini('top-end', 'error', 'Error al eliminar el telefono', 3000);
    }
  } catch (error) {
    console.error('Error al eliminar:', error);
    this.utilService.AlertMini('top-end', 'error', 'Error inesperado al eliminar', 3000);
  }
}

  limpiar() {
    this.IPhone = {
      id: 0,
      id_user: this.idUser,
      phone: '',
      type: undefined,
      status: undefined,
    };
  }

  ModalActualizar(modal, row) {
    this.showAddButton = false;
    this.title_modal = 'Actualizar Telefono ' + row.phone;
    this.IPhone.id = row.id;
    this.IPhone.phone = row.phone;
    this.IPhone.type = row.type;
    this.IPhone.status = row.status;
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }

  ModalAgregar(modal) {
    this.limpiar();
    this.showAddButton = true;
    this.title_modal = 'Agregar País ';
    this.modalService.open(modal, {
      centered: true,
      size: 'lg',
      backdrop: false,
      keyboard: false,
      windowClass: 'fondo-modal',
    });
  }


  async Actualizar() {
  try {
    this.xAPI = {
      funcion: environment.xApi.PHONE.update,
      parametros: '',
      valores: JSON.stringify(this.IPhone)
    };

    const data = await this.apiService.Ejecutar(this.xAPI).toPromise();

    if (data.tipo === 1) {
        this.list = [];
        this.modalService.dismissAll();
        this.ListarGet();
        this.limpiar();
      this.utilService.AlertMini('top-end', 'success', 'Telefono Actualizado Exitosamente', 3000);
    } else {
      this.utilService.AlertMini('top-end', 'error', 'Error al actualizar el telefono', 3000);
    }
  } catch (error) {
    console.error('Error en Actualizar:', error);
    this.utilService.AlertMini('top-end', 'error', 'Error al actualizar el telefono', 3000);
  }
}


async Agregar() {
  this.IPhone.id_user = this.idUser
  try {
    this.xAPI = {
      funcion: environment.xApi.PHONE.create,
      parametros: '',
      valores: JSON.stringify(this.IPhone)
    };

    const data = await this.apiService.Ejecutar(this.xAPI).toPromise();

    if (data.tipo === 1) {
      this.list = [];
      this.modalService.dismissAll();
      await this.ListarGet();
      this.utilService.AlertMini('top-end', 'success', 'Telefono Agregado Exitosamente', 3000);
    } else {
      this.utilService.AlertMini('top-end', 'error', 'Error al agregar el telefono', 3000);
    }
  } catch (error) {
    console.error('Error en Agregar:', error);
     this.utilService.AlertMini('top-end', 'error', 'Error al agregar el telefono', 3000);
  }
}

}

