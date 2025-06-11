import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { CoreConfigService } from '@core/services/config.service';
import { UtilService } from '@core/services/util/util.service';
import { ApiService, IAPICore } from '@core/services/apicore/api.service';
import { Router } from '@angular/router';
import { LoginService } from '@core/services/seguridad/login.service';
import jwt_decode from "jwt-decode";
import Swal from 'sweetalert2';


@Component({
  selector: 'app-auth-forgot-password-v2',
  templateUrl: './auth-forgot-password-v2.component.html',
  styleUrls: ['./auth-forgot-password-v2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AuthForgotPasswordV2Component implements OnInit {

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


  public img
  public appLogoImage
  public appName

  public fnx;

  public SelectedTipoRegistro = [
    { id: '1', name: 'Operador Postal Privado' },
    { id: '2', name: 'Subcontratista' }
  ]
  public SelectedTipoEmpresa = []

  public SelectedTipoAgencia = []

  public SelectedTipologia = []

  public tokenPWD

  public itk

  // Public
  public emailVar;
  public coreConfig: any;
  public forgotPasswordForm: FormGroup;
  public submitted = false;

  public show = false
  public btn = false
  public btnValidarCorreo = 'Validar Correo Electronico'
  public btnRestablecerCorreo = 'Restablecer Contraseña'

  public inputEmail
  public inputRif
  public inputTipoRegistro
  public inputTipologia
  public inputTipoAgencia
  // Private
  private _unsubscribeAll: Subject<any>;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   * @param {FormBuilder} _formBuilder
   *
   */
  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: FormBuilder,
    private utilservice: UtilService,
    private apiService: ApiService,
    private _router: Router,
    private loginService: LoginService,
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
    return this.forgotPasswordForm.controls;
  }

  /**
   * On Submit
   */
  async onSubmit() {
    
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.xAPI.funcion = 'IPOSTEL_R_Login_Forgot_Password';
    this.xAPI.parametros = this.forgotPasswordForm.value.email;
    this.xAPI.valores = '';

    sessionStorage.removeItem("token-forgot-password");

    try {
      const data = await this.loginService.getLoginExternas(this.xAPI).toPromise();

      this.itk = data;
      sessionStorage.setItem("token-forgot-password", this.itk.token);

      const stoken: any = jwt_decode(data.token);

      // Usar await para esperar a que se complete el envío del correo
      await this.EnviarCorreo(
        stoken.Usuario[0].correo_electronico,
        this.itk.token,
        stoken.Usuario[0].nombre_empresa
      );

      this.utilservice.alertConfirmMini('success', 'Felicidades! <br> Se ha enviado un correo electrónico con la información para restablecer su contraseña');
      this._router.navigate(['/']);

    } catch (error) {
      console.error('Error en onSubmit:', error);
      this.utilservice.alertConfirmMini('warning', '<font color="red">Oops Lo sentimos!</font><br> Alguno de los campos son incorrectos, verifiquelos e intente de nuevo');
    }
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  async ngOnInit() {
    this.forgotPasswordForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
      this.img = this.coreConfig.layout.skin
      this.appLogoImage = this.coreConfig.app.appLogoImage
      this.appName = this.coreConfig.app.appName

    });
  }


  async EnviarCorreo(email: string, hash: string, usuario: string): Promise<void> {
    this.fnx = {
      funcion: 'Fnx_EnviarMailCurl',
      MAIL: email,
      HASH: hash,
      EMPRESA: usuario,
      TITULO: "IPOSTEL - SIRPVEN - Recuperar Contraseña 🔐",
      IMG: "https://sirp.ipostel.gob.ve/app/assets/images/banner/cintillo.png",
      URL: "https://sirp.ipostel.gob.ve/app/#/reset-password",
      INSTITUTO: "INSTITUTO POSTAL TELEGRÁFICO DE VENEZUELA",
      SLOGAN: "SIRPVEN - IPOSTEL"

    };

    try {
      const data = await this.apiService.ExecFnxDevel(this.fnx).toPromise();
      // Validar que data no sea undefined y que tenga la propiedad Cuerpo
      if (data && data.Cuerpo && data.Cuerpo.length > 0) {
        this.utilservice.alertConfirmMini('success', 'Felicidades! <br> ');
      } else {
        this.utilservice.alertConfirmMini('warning', '<font color="red">Oops Lo sentimos!</font><br> No se pudo enviar el correo.');
      }
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      this.utilservice.alertConfirmMini('error', '<font color="red">Error!</font><br> No se pudo enviar el correo.');
      throw error; // Propagar el error
    }
  }

    ValidarSeleccion(event, Qr) {
      if (Qr !== undefined) {
        switch (event) {
          case 1:
            this.Certificado(Qr)
            break;
          case 2:
            this.Philately(Qr)
            break;
  
          default:
            break;
        }
      } else {
        Swal.fire({
          title: 'Oops Lo Sentimos!',
          text: 'El Campo Codigo QR es obligatorio',
          icon: 'warning',
        })
      }
    }
  
    async Certificado(id: string) {
      // console.log(id)
      this.xAPI.funcion = "IPOSTEL_R_Certificados";
      this.xAPI.parametros = `${id}`
      this.xAPI.valores = ''
      await this.apiService.EjecutarDev(this.xAPI).subscribe(
        (data) => {
          // console.log(data)
          if (data.Cuerpo.length != 0) {
            this.Qr = ''
            this.TipoSeleccion = undefined
            // console.log(data.Cuerpo[0])
            var cert = data.Cuerpo[0]
            switch (cert.type) {
              case 1:
                this.tipo = 'Certificado Unico de Inscripción'
                break;
              case 2:
                this.tipo = 'Autorización Postal'
                break;
              default:
                break;
            }
            Swal.fire({
              html: `
                        <div class="card card-congratulations">
                          <div class="card-body text-center">
                            <div class="avatar avatar-xl bg-primary shadow">
                            </div>
                            <div class="text-center">
                              <h1 class="mb-1 text-white">${cert.nombre_empresa}</h1>
                              <p class="card-text m-auto w-50">
                              RIF: ${cert.rif}
                              </p>
                              <p class="card-text m-auto w-100">
                              DIRECCIÓN: ${cert.direccion_empresa}
                              </p>
                              <p class="card-text m-auto w-75">
                              ${cert.correo_electronico}
                              </p>
                            </div>
                            <br>
                            <p align="left">
                            ${this.tipo}
                            </p>
                            <p align="right">
                            ${cert.token}
                            </p>
                          </div>
                        </div>
                  `,
              footer: `
                  <div class="auth-footer-btn d-flex justify-content-center">
                    <p class="text-center mt-2">
                  <small align="center"><strong>INSTITUTO POSTAL TELEGRÁFICO DE VENEZUELA</strong> <br>  RIF G-20000043-0
                  <br>
                  Dirección : Avenida José Ángel Lamas, San Martín, Caracas, edificio Centro Postal Caracas, Distrito Capital
                  <br>
                  E-mail: <a href="mailto:tsuarez@ipostel.gob.ve">tsuarez@ipostel.gob.ve</a>
                  <br>
                  Telf: <a href="Tel:02124053340">0212-405.33.40</a> / 0412-711.08.00 / fax: 0212-405.33.66
                  </small>
                  </p>
                </div>
                  `,
              icon: 'success',
              width: '900px',
              allowOutsideClick: false,
              allowEscapeKey: false,
              allowEnterKey: false,
              showConfirmButton: false,
              showCloseButton: true,
            })
          } else {
            // this.Qr = ''
            Swal.fire({
              title: 'Certificado NO Valido!',
              text: 'Lo sentimos, este certificado no es generado por nuestro sistema.',
              icon: 'error',
            })
          }
        },
        (error) => {
          //   console.log(error)
          this.utilservice.alertMessageAutoCloseTimer(5000, '<font color="red">Estimado Usuario</font>', '<strong><h4>En este momento estamos presentando fallas de conexión, intente de nuevo</h4></strong>')
        }
      )
    }
  
    async Philately(id: string) {
      Swal.fire({
        title: 'Franqueo Postal Previo',
        text: 'El Codigo del QR es de prueba',
        icon: 'warning',
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: 'Custom image',
      })
      this.Qr = ''
      this.TipoSeleccion = undefined
  
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
