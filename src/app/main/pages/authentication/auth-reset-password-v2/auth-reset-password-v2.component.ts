import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CoreConfigService } from '@core/services/config.service';
import { Router } from '@angular/router';
import { UtilService } from '@core/services/util/util.service';
import { ApiService, IAPICore } from '@core/services/apicore/api.service';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2';


@Component({
  selector: 'app-auth-reset-password-v2',
  templateUrl: './auth-reset-password-v2.component.html',
  styleUrls: ['./auth-reset-password-v2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthResetPasswordV2Component implements OnInit {

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };


  public foto = 'assets/images/background/background.jpeg'

  public Qr
  public TipoVerificacion = [
    { id: 1, name: 'Certificado' },
    // { id: 2, name: 'Filatelia' }
  ]
  public TipoSeleccion
  public tipo


  // Public
  public coreConfig: any;
  public passwordTextType: boolean;
  public confPasswordTextType: boolean;
  public resetPasswordForm: FormGroup;
  public submitted = false;

  public img
  public appLogoImage
  public appName


  public TokenEmail
  public token
  public uri

  public firstId
  public secondId

  public stoken: { Usuario: { [key: string]: any }[] }
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private utilservice: UtilService,
    private apiService: ApiService,

    private rutaActiva: ActivatedRoute
  ) {
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
    return this.resetPasswordForm.controls;
  }

  /**
   * Toggle password
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  /**
   * Toggle confirm password
   */
  toggleConfPasswordTextType() {
    this.confPasswordTextType = !this.confPasswordTextType;
  }

  /**
   * On Submit
   */
  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.resetPasswordForm.invalid) {
      return;
    }
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  async ngOnInit() {
    this.resetPasswordForm = this._formBuilder.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    });


    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
      this.img = this.coreConfig.layout.skin
      this.appLogoImage = this.coreConfig.app.appLogoImage
      this.appName = this.coreConfig.app.appName
    });

  }

  async ResetPassword() {
    // Validar que las contraseñas coincidan
    if (this.resetPasswordForm.value.newPassword !== this.resetPasswordForm.value.confirmPassword) {
      this.utilservice.alertConfirmMini('error', '<font color="red">Oops!</font> <br> Las contraseñas no coinciden. Verifique e intente de nuevo.');
      return; // Detener la ejecución si las contraseñas no coinciden
    }

    this.xAPI.funcion = 'IPOSTEL_U_ResetPassword';
    this.xAPI.parametros = '';
    this.xAPI.valores = JSON.stringify({});

    try {
      const data = await this.apiService.EjecutarDev(this.xAPI).toPromise();
      if (data.tipo == 1) {
        this.utilservice.alertConfirmMini('success', 'Felicidades<br> su contraseña fue actualizada satisfactoriamente!');
        this._router.navigate(['/']);
        sessionStorage.clear();
      } else {
        this.utilservice.alertConfirmMini('error', '<font color="red">Oops Lo sentimos!</font> <br> Algo salio mal!, Verifique e intente de nuevo');
      }
    } catch (error) {
      console.error(error);
    }
  }


  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
