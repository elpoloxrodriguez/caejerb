import { Component, HostListener, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { CoreConfigService } from '@core/services/config.service';
import Swal from 'sweetalert2';
import { ApiService, IAPICore } from '@core/services/apicore/api.service';
import { CoreMenuService } from '@core/components/core-menu/core-menu.service';
import { UtilService } from '@core/services/util/util.service';
import jwt_decode from "jwt-decode";
import { VERSION } from '@angular/core';
import { Md5 } from 'ts-md5/dist/md5';
import { environment } from 'environments/environment';
import { UpdateService } from 'app/auth/service';
import { IToken, LoginService } from '@core/services/seguridad/login.service';
import { Sha256Service } from '@core/services/login/sha256';

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
    private sha256Service: Sha256Service,
  ) {
    this.token = undefined;
    this._unsubscribeAll = new Subject();

    this.loginForm = this._formBuilder.group({
      cedula: ['', [Validators.required]],
      clave: ['', Validators.required]
    });

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


  iniciar() {
    this.submitted = true;
    
    if (this.loginForm.invalid) {
      return;
    }
    
    this.loading = true;
    // Your login logic here
    this.login()
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


  async login() {
    this.submitted = true;
    this.loading = true;

  try {
    // First hash the password
    const hashedPassword = await this.sha256Service.hash(this.loginForm.value.clave);
    
    // Update the form value with the hashed password
    this.loginForm.value.clave = hashedPassword;

    // Set up the API call
    this.xAPI.funcion = environment.xApi.INICIAR_SESION;
    this.xAPI.parametros = `${this.loginForm.value.cedula},${hashedPassword}`;
    this.xAPI.valores = '';

    // Make the API call
    const data = await this.loginService.getLoginExternas(this.xAPI).toPromise();
    
    console.log(data);
    const stoken = jwt_decode(data.token);
    this.sessionTOKEN = stoken;
    sessionStorage.setItem("token", data.token);
    this._router.navigate(['']).then(() => { window.location.reload() });  } catch (error) {
    this.loading = false;
    this._router.navigate(['login']);
    this.utilservice.alertConfirmMini('error', 'Usuario y/o Contraseña Incorrectos, Verifique e Intente Nuevamente');
    this.usuario = '';
    this.clave = '';
  }
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
