import { Component, HostListener, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';
import { IToken, LoginService } from '@core/services/seguridad/login.service';
import Swal from 'sweetalert2';
import { ApiService, IAPICore } from '@core/services/apicore/api.service';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { UtilService } from '@core/services/util/util.service';
import jwt_decode from "jwt-decode";
import { VERSION } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';
import { Auditoria, InterfaceService } from 'app/main/audit/auditoria.service';
import { environment } from 'environments/environment';
import { UpdateService } from 'app/auth/service';

@Component({
  selector: 'app-auth-login-v2',
  templateUrl: './auth-login-v2.component.html',
  styleUrls: ['./auth-login-v2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthLoginV2Component implements OnInit {

  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    event.preventDefault();
  }


  checkboxValue = false;
  checkboxControl = new FormControl(this.checkboxValue);

  public xAuditoria: Auditoria = {
    id: '',
    usuario: '',
    funcion: '',
    metodo: '',
    fecha: '',
  }

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  token: string | undefined;


  public btnShowsubcontractors: boolean = false

  public fecha = new Date();
  public hora = this.fecha.getHours();
  public dia = this.fecha.getDay();
  public btnShow = false

  public tipo

  //  Public
  public coreConfig: any;
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;
  public error = '';
  public passwordTextType: boolean;
  public usuario: string;
  public clave: string;

  public sessionTOKEN

  public foto = 'assets/images/fondo.webp'

  public Nsession: string = '0';

  //  QR certifucado
  public Qr
  public img
  public appLogoImage
  public appName
  public infoUsuario
  public iToken: IToken = { token: '', };
  public itk: IToken;
  // Private
  private _unsubscribeAll: Subject<any>;

  public TipoVerificacion = [
    { id: 1, name: 'Certificado' },
    // { id: 2, name: 'Filatelia' }
  ]
  public TipoSeleccion

  public tokenA

  public idFnx // ID de la funcion

  public production = environment.production


  private updateSubscription: Subscription;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(
    private updateService: UpdateService,
    private _coreMenuService: CoreMenuService,
    private apiService: ApiService,
    private _coreConfigService: CoreConfigService,
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private loginService: LoginService,
    private _router: Router,
    private utilservice: UtilService,
    private rutaActiva: ActivatedRoute,
    private auditoria: InterfaceService
  ) {
    this.token = undefined;
    this._unsubscribeAll = new Subject();

    // Configure the layout
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

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit() {
    this.submitted = true;
    // this.login(this.loginForm)

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }
    if (sessionStorage.getItem("token") != undefined) {
      this._router.navigate(['/']);
    }

    // Login
    this.loading = true;

    // redirect to home page
    setTimeout(() => {
      this._router.navigate(['/']);
    }, 200);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  async ngOnInit() {

    this.updateSubscription = this.updateService.updateAvailable$.subscribe(
      (isAvailable: boolean) => {
        if (isAvailable) {
          this.btnShow = true;
        }
      }
    );

    if (sessionStorage.getItem("token") != undefined) {
      this._router.navigate(['/home'])
      return
    }
    this.loginForm = this._formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
      // console.log(this.coreConfig)
      this.img = this.coreConfig.layout.skin
      this.appLogoImage = this.coreConfig.app.appLogoImage
      this.appName = this.coreConfig.app.appName
    });
  }

  toggleCheckbox(event: any) {
    this.checkboxValue = event.target.checked;
    this.checkboxControl.setValue(this.checkboxValue);
  }


  public send(form: NgForm): void {
    if (this.production === true) {
      if (form.invalid) {
        for (const control of Object.keys(form.controls)) {
          form.controls[control].markAsTouched();
        }
        return;
      }
      if (form.invalid != true) {
        this.login()
      }
    } else {
      this.login()
    }
  }


  login() {
    this.submitted = true;
    this.loading = true;
    const md5 = new Md5();
    const password = md5.appendStr(this.clave).end()
    // var Xapi = {
    //   "funcion": 'IPOSTEL_R_Login',
    //   "parametros": this.usuario + ',' + password
    // }
    if (this.checkboxValue == false) {
      this.xAPI.funcion = "IPOSTEL_R_LoginOperador"
      this.xAPI.parametros = this.usuario + ',' + password
      this.xAPI.valores = ''
      // alert('Eres Operador') 
    } else {
      // alert('Eres subcontratista')
      this.xAPI.funcion = "IPOSTEL_R_LoginSubcontratista"
      this.xAPI.parametros = this.usuario + ',' + password
      this.xAPI.valores = ''
    }
    this.loginService.getLoginExternas(this.xAPI).subscribe(
      (data) => {
        const stoken = jwt_decode(data.token)
        this.sessionTOKEN = stoken
        const tokenSession = this.sessionTOKEN.Usuario[0].status_empresa
        switch (tokenSession) {
          case 0:
            this.utilservice.alertConfirmMini('error', '<strong><font color="red">Oops lo sentimos!</font></strong> <br> Estimado usuario su cuenta aun no se encuentra validada por <strong><font color="red">IPOSTEL</font></strong>, porfavor intente de nuevo mas tarde.');
            this.loading = false;
            this._router.navigate(['login'])
            break;
          case 1:
            this.itk = data;
            sessionStorage.setItem("token", this.itk.token);
            this.infoUsuario = jwt_decode(sessionStorage.getItem('token'));
            // AUDITORIA //
            this.tokenA = jwt_decode(sessionStorage.getItem('token'))
            this.xAuditoria.id = this.utilservice.GenerarUnicId()
            this.xAuditoria.usuario = this.tokenA.Usuario[0]
            this.xAuditoria.funcion = this.xAPI.funcion
            this.xAuditoria.parametro = this.xAPI.parametros
            this.xAuditoria.metodo = 'Entrando al Sistema'
            this.xAuditoria.fecha = Date()
            // AUDITORIA //

            this.utilservice.alertConfirmMini('success', `Bienvenido al IPOSTEL`);
            // INICIO AGREGAR AUDITORIA //
            this.auditoria.InsertarInformacionAuditoria(this.xAuditoria)
            // FIN AGREGAR AUDITORIA //

            this._router.navigate(['']).then(() => { window.location.reload() });
            break;
          case 2:
            this.utilservice.alertConfirmMini('error', '<strong><font color="red">Oops lo sentimos!</font></strong> <br> Estimado usuario su cuenta Deshabilitada por <strong><font color="red">REVOCATORIA</font></strong>, porfavor pongase en contacto con la administración de IPOSTEL.');
            this.loading = false;
            this._router.navigate(['login'])
            break;
          case 3:
            this.utilservice.alertConfirmMini('error', '<strong><font color="red">Oops lo sentimos!</font></strong> <br> Estimado usuario su cuenta Deshabilitada por <strong><font color="red">FINIQUITO DE CONTRATO</font></strong>, porfavor pongase en contacto con la administración de IPOSTEL.');
            this.loading = false;
            this._router.navigate(['login'])
            break;
          case 4:
            this.utilservice.alertConfirmMini('error', '<strong><font color="red">Oops lo sentimos!</font></strong> <br> Estimado usuario su cuenta Deshabilitada por <strong><font color="red">NO MOVILIZACIÓN DE PIEZAS</font></strong>, porfavor pongase en contacto con la administración de IPOSTEL.');
            this.loading = false;
            this._router.navigate(['login'])
            break;
          default:
            break;
        }
      },
      (error) => {
        this.loading = false;
        this._router.navigate(['login'])
        this.utilservice.alertConfirmMini('error', 'Usuario y/o Contraseña Incorrectos, Verifique e Intente Nuevamente')
        this.usuario = ''
        this.clave = ''
      }
    );
  }


  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }
}
