import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { ApiService } from '@core/services/api.service';
import { IToken } from '@core/services/seguridad/login.service';


export interface Usuario {
  cedula?: string;
  nombre?: string;
  tipo?: string;
  componente?: string;
  clave: string;
  correo?: string;
}



@Injectable({
  providedIn: 'root'
})
export class LoginService {
  public url: string =  environment.api;
  public id = '';
  public sToken: any;
  public token: any;
  public usuario: any;
  public aplicacion: any;

  constructor(private router: Router, private http: ApiService) {
    this.id = environment.id;
    if (this.hayToken()) { this.sToken = sessionStorage.getItem('token'); }
    // if (sessionStorage.getItem('token') !== undefined) {
    // }
  }

  async Iniciar() {
    await this.getUserDecrypt();
    // this.obenterAplicacion();
  }

  getLogin(user: Usuario): Observable<IToken> {    
    return this.http.postLogin<Usuario, IToken>(environment.subPath.LOGIN, user);
  }

  getLoginRecovery(user: Usuario): Observable<IToken> {    
    return this.http.postLogin<Usuario, IToken>(environment.subPath.RECOVERY, user);
  }

  makeUser(user: Usuario): Observable<any> {
    const url = this.url + 'identicacion';
    return this.http.postLogin<Usuario, any>(url, user, {});
  }

  cerrarSesion() {
    Swal.close();
    this.router.navigate(['login']);
    this.removeSessionStorage('id');
    this.removeSessionStorage('token');
  }

  cerrarMsg(){
    Swal.fire({
      title: 'Esta seguro',
      text: "de salir del sistema?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Desconectarse',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cerrarSesion()
      }
    })    
  }

  protected getUserDecrypt(): any {
    const e = sessionStorage.getItem('token');
    const s = e.split('.');

    const str = atob(s[1]);
    this.token = JSON.parse(str);
    this.usuario = this.token.Usuario;
    return JSON.parse(str);
  }

    // ObenterAplicacion
  protected obenterAplicacion() {
    const app = this.token.Usuario.Aplicacion;
    app.forEach(e => {
      if (e.id === this.id) {
        this.aplicacion = e;
      }
    });
  }

  obtenerMenu(): any {
    return this.aplicacion.Rol.Menu;
  }

  obtenerSubMenu(idUrl: string): any {
    const app = this.aplicacion;
    let subMenu = [];
    app.Rol.Menu.forEach(e => {
      if (e.url === idUrl) {
        subMenu = e.SubMenu;
      }
    });
    return subMenu;
  }

  /* ELIMINAR CUALRQUIER COSA EN EL SESSION STORAGE DEBES MANDAR EL KEY */
  protected removeSessionStorage(key: any) {
    sessionStorage.removeItem(key);
  }

   /*** EL TOKEN EXISTE?
   * SI => TRUE, NO => FALSE
   **/
  hayToken() {
    return sessionStorage.getItem('token')==undefined ? false : true;
  }

}
