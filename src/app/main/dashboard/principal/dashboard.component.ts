import { Component, OnInit, ViewEncapsulation, ViewChild, Injectable } from '@angular/core';
import { ApiService, IAPICore } from '@core/services/apicore/api.service';
import { UtilService } from '@core/services/util/util.service';
import jwt_decode from "jwt-decode";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import puppeteer from 'puppeteer';

import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, NavigationExtras } from '@angular/router';


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

  public urlPetro: string = 'https://www.petro.gob.ve/es/'
  public urlBcv: string = 'https://www.bcv.org.ve/'


  public rowsCuentasBancarias
  public rowsBancos = []


  public title

  public DataEmpresa
  public token
  public empresa = false
  public usuario = false
  public n_curp
  public statusEmpresaOPP = false
  public statusEmpresaSUB = false


  public empresaOPP = false
  public empresaSUB = false

  public fecha = new Date('yyyy-MM-dd HH:mm:ss');
  public fechax = new Date();
  public aniox = this.fechax.getFullYear();
  public anio = this.fecha.getFullYear();
  public mes = this.fechax.getMonth();


  public hora
  public fecha_Actual_convert
  public hora_Actual_convert
  public role

  public MesAnio

  public bolivares
  public dolar
  public petro
  public bolivaresx
  public dolarx
  public petrox

  public DatosSub_OPP = []

  public mes_consultar
  // 
  public EmpresasLiquidadasResult = 0 // Numero de empresas que pagaron
  public EmpresasTotales = 0 // Total de empresas registradas
  public EmpresasReparosResult = 0 // Numero de empresas que no pagaron
  public recaudacionPorcentajeLiquidado // % de Recaudacion
  public recaudacionPorcentajeReparos // % de Reparos
  public TotalPiezas = 0 // Total de numero de piezas
  public IngresosTotales // Monto Total Recaudado 
  public EstimadoDolar // % de Estimado en $
  public EstimadoPetro // % de Estimado en Petro
  public ServicioNacional
  public TotalPiezasNacionales = []
  public ServicioIntLlegada
  public TotalPiezasIntLlegada = []
  public ServicioIntSalida
  public TotalPiezasIntSalida = []
  public TotalServicios
  public TotalServiciosCompletos = []
  public PorcentajeLiquidado
  public PorcentajeReparos
  public CantidadLiquidados = 0
  public CantidadLiquidadosX = []
  public TotalCantidadLiquidados = []
  public CartasNoMovilizacion = 0
  public CartasNoMovilizacionX = []
  public OtrosPagos = 0
  public OtrosPagosX = []
  public TotalFPO = 0
  public TotalFPOX = []
  public TotalPagosFPO
  public TotalPagosFPOX = []
  public totalpagosFPO = 0

  public fpo: any = 0
  public fpoX = []
  public fpo_OtrosMeses: any = 0
  public fpo_OtrosMesesX = []
  public derechosSemestral1: any = 0
  public derechosSemestral1X = []
  public derechosSemestral2: any = 0
  public derechosSemestral2X = []
  public anualidad: any = 0
  public anualidadX = []
  public subcontratistas: any = 0
  public subcontratistasX = []
  public pagosNoLiquidados: any = 0
  public pagosNoLiquidadosX = []
  // 


  constructor(
    private modalService: NgbModal,
    private _router: ActivatedRoute,
    private apiService: ApiService,
    private utilService: UtilService,
    private httpClient: HttpClient
  ) { }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------
  /**
   * On init
   */
  async ngOnInit() {


  }


}
