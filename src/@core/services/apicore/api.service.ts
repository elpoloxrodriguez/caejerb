import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { UtilService } from '../util/util.service';
import { WsocketsService } from '../websockets/wsockets.service';





export interface IAPICore {
  id?: string
  concurrencia?: boolean
  ruta?: string
  funcion?: string
  parametros?: string
  protocolo?: string
  retorna?: boolean
  migrar?: false
  modulo?: string
  relacional?: boolean
  valores?: any
  coleccion?: string
  version?: string
  http?: number
  https?: number
  consumidores?: string
  puertohttp?: number
  puertohttps?: number
  driver?: string
  query?: string
  metodo?: string
  tipo?: string
  prioridad?: string
  logs?: boolean
  descripcion?: string
  entorno?: string
  cache?: number
  estatus?: boolean
  categoria?: string
  entradas?: string
  salidas?: string
  funcionalidad?: string
}

export interface ObjectoGenerico {
  idw: number,
  nomb: string,
  obse: string
}

export interface IPOSTEL_I_ArchivoDigital {
  usuario?: string //CodeEncrypt
  nombre?: string
  empresa?: string
  numc?: string
  tipo?: number
  vencimiento?: string
}

export interface ProcessID {
  id: string,
  estatus: boolean,
  contenido?: string,
  mensaje?: string,
  segundos: string,
  rs?: any
}

@Injectable({
  providedIn: 'root'
})


export class ApiService {

  public pID: ProcessID = {
    id: '',
    estatus: false,
    mensaje: '',
    segundos: '',
    contenido: '',
    rs: null
  }


  //Dirección Get para servicios en la página WEB
  URL = environment.api;
  RUTA = environment.url;
  hash = environment.hash;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    })
  };

  httpOptionsQR = {
    headers: new HttpHeaders({
      'Content-Type': 'text/plain',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    })
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private utilservice: UtilService,
    private ws: WsocketsService
  ) {

  }


  //Ejecutar Api generales
  ExecFnx(fnx: any): Observable<any> {
    var url = this.URL + "fnx";
    return this.http.post<any>(url, fnx, this.httpOptions);
  }

  ExecFnxDevel(fnx: any): Observable<any> {
    var url = "/devel/api/fnx";
    return this.http.post<any>(url, fnx, this.httpOptions);
  }


  //  Consulta el PID de una funcion
  ExecFnxId(id: string): Observable<any> {
    var url = `/devel/api/fnx:${id}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  ExecColeccionAuditoria(xObjeto, token): Observable<any> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      })
    };
    var url = "/v1/api/mcoleccion" + this.hash;
    return this.http.post<any>(url, xObjeto, httpOptions);
  }


  Guardar(xAPI: IAPICore, sApi: string): Observable<any> {

    var url = this.URL + sApi + this.hash;
    return this.http.post<any>(url, xAPI, this.httpOptions);
  }

  Listar(): Observable<any> {
    var url = this.URL + 'listar';
    return this.http.get<any>(url, this.httpOptions);
  }

  /**
   * Ejecutar la coleccion
   * @param xObjeto Objeto Coleccion
   * @returns 
   */
  ExecColeccion(xObjeto): Observable<any> {
     let httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('recovery')
    })
  };
    var url = "/v1/api/ccoleccion";
    return this.http.post<any>(url, xObjeto, httpOptions);
  }

  //Ejecutar Api generales
  Ejecutar(xAPI: IAPICore): Observable<any> {
    // var url = this.URL + "accion" + this.hash;
    var url = "/v1/api/accion" + this.hash;
    // if (environment.production === true) {
    //   var url = this.RUTA  + this.URL + "accion" + this.hash;
    // } else {
    //   var url = this.URL + "accion" + this.hash;
    // }
    return this.http.post<any>(url, xAPI, this.httpOptions);
  }

  


  //Ejecutar Api generales
  EjecutarDev(xAPI: IAPICore): Observable<any> {
    var url = "/devel/api/accion" + this.hash;
    return this.http.post<any>(url, xAPI, this.httpOptions);
  }

  //EnviarArchivos generales
  EnviarArchivos(frm: FormData): Observable<any> {
    var httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    // return this.http.post<any>(this.URL + "subirarchivos", frm, httpOptions);
    return this.http.post<any>("/v1/api/subirarchivosdinamicos", frm, httpOptions);
  }


  LeerDispositivoMovil(): Observable<any> {
    return this.http.get<any>("v1/api/dispositivos");
  }

  LeerMensajesDispositivo(): Observable<any> {
    return this.http.get<any>("v1/api/listar-chats");
  }

  EnviarMensajesDispositivo(mensaje: any): Observable<any> {
    return this.http.post<any>("v1/api/enviarSMS", mensaje);
  }


  //ListarModulos
  ListarModulos(): Observable<any> {
    var url = this.URL + "lmodulos";
    return this.http.get<any>(url, this.httpOptions)
  }

  //ListarArchivos
  ListarArchivos(id: string): Observable<any> {
    var url = this.URL + "larchivos/" + id;
    return this.http.get<any>(url, this.httpOptions)
  }

  //ListarArchivos
  ProcesarArchivos(obj: any): Observable<any> {
    var url = this.URL + "phtml";
    return this.http.post<any>(url, obj, this.httpOptions)
  }


  Dws(peticion: any) {
    // return '/v1/api/dws/' + peticion
    // console.log('Archivo', peticion)
    return '/v1/api/dw/' + peticion
  }

  DwsArchivo(peticion: string) {
    // let ruta = this.URL + 'dws/' + peticion
    let ruta = '/v1/api/dwsdinamico/' + peticion
    // console.log(ruta)
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      }),
      responseType: 'blob' as 'json'
    };
    this.http.get(ruta, httpOptions).subscribe((response: any) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    });
  }

  // Consulta el Pid recursivamente
  ConsultarPidRecursivo(id: string, paquete: any) {
    this.ExecFnxId(id).subscribe(
      (data) => {
        setTimeout(() => {
          if (data.documento == 'PROCESADO') {
            this.pID.id = id
            this.pID.estatus = false
            this.pID.contenido = paquete
            this.ws.lstpid$.emit(this.pID)
          } else {
            this.ConsultarPidRecursivo(id, paquete)
          }
        }, 10000)
      },
      (error) => {
        console.log(error)
      }
    )
  }

  // Servicio para sandra_sms
  ConsultarPidSandraSms(id: string, paquete: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.ExecFnxId(id).subscribe(
        (data) => {
          setTimeout(() => {
            if (data.documento == 'PROCESADO') {
              this.pID.id = id;
              this.pID.estatus = false;
              this.pID.contenido = paquete;
              this.ws.pidDevice$.emit(this.pID);
              resolve(data); // Resuelve la promesa con los datos
            } else {
              this.ConsultarPidSandraSms(id, paquete).then(resolve).catch(reject);
            }
          }, 1000);
        },
        (error) => {
          // console.log(error);
          reject(error); // Rechaza la promesa en caso de error
        }
      );
    });
  }


  GenQR(id: string, ruta: string): Observable<any> {
    // var rut = atob(ruta)
    // console.log(rut)
    // console.log(id+' '+atob(ruta))
    // return this.http.get<any>(this.URL + 'genqr/' + id+'/'+ruta, this.httpOptions)
    return this.http.get<any>('/v1/api/genqr/' + id + '/' + ruta, this.httpOptions)
  }

  LoadQR(id: string): Observable<any> {
    // return this.http.get<any>(this.URL + 'imgslocalbase64/' + id, this.httpOptionsQR)
    return this.http.get<any>('/v1/api/imgslocalbase64/' + id, this.httpOptionsQR)
  }


  GenerarCodigo(Entradas: string, funcion: string, ruta: string): string {
    const json = JSON.parse(Entradas)
    var strI = '/*!\n'
    strI += '* Code Epic Technologies v1.0.1 (https://dev.code-epic.com)\n'
    strI += '* Copyright 2020-2022 CodeEpicTechnologies <http://code-epic.com>\n'
    strI += '* Licensed under MIT (https://code-epic.github.io)\n'
    strI += '*/\n'
    strI += 'export interface ' + funcion + ' {\n'
    json.forEach(value => {
      value.entradas.forEach(e => {
        strI += '\t' + e.alias + '\t ?:\t' + this.seleccionarTipo(e.tipo) + '\n'
      });
    });

    strI += '}\n'
    strI += 'this.xAPI.funcion = \'' + funcion + '\'\n'
    strI += 'this.xAPI.parametros = \'\'\n'
    strI += 'this.xAPI.valores = JSON.stringify(' + funcion + ')\n'
    strI += 'const url = \'' + ruta + '\'\n'
    strI += 'const api = http.post<any>(url, this.xAPI, httpOptions)\n'
    strI += 'api.subcribe(\n'
    strI += '\t(data) => {\n'
    strI += '\t\tconsole.info(data)\n'
    strI += '\t},\n'
    strI += '\t(error) => {\n'
    strI += '\t\tconsole.error(error)\n'
    strI += '\t}\n'
    strI += ')\n'
    return strI
  }

  seleccionarTipo(tipo: string): string {
    var c = ''
    switch (tipo) {
      case 'int':
        c = 'number'
        break;
      case 'sql':
        c = 'string'
        break;
      default:
        c = tipo
        break;
    }
    return c
  }
}
