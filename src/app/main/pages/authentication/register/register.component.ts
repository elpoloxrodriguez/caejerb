import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CoreConfigService } from '@core/services/config.service';
import { IAPICore, ApiService } from '@core/services/apicore/api.service';
import { UtilService } from '@core/services/util/util.service';
import { environment } from 'environments/environment';
import { MilitaryData, MilitaryService } from 'app/main/services/military.service';
import { LoginService, Usuario } from 'app/main/services/login.service';
import { Sha256Service } from '@core/services/login/sha256';
import { hash } from 'crypto';
import { MilitaryUpdateService } from 'app/main/services/military-update-service';



@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit, OnDestroy {

  @HostListener('contextmenu', ['$event'])
  onRightClick(event) {
    event.preventDefault();
  }

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  // Public properties
  public coreConfig: any;
  public loginForm: FormGroup;
  public loading = false;
  public submitted = false;
  public returnUrl: string;
  public error = '';
  public passwordTextType: boolean;


  public militarData: MilitaryData = {
    cedula: '',
    categoria: '',
    clase: '',
    codigocomponente: '',
    componente: undefined,
    grado: undefined,
    id: '',
    numerohistoria: '',
    persona: undefined,
    situacion: '',
    unidadsuperior: '',
    unidadorigen: ''
  }

  // Form fields

  public foto = 'assets/images/fondo.webp';
  public appName: string;
  public appLogoImage: string;

  // Private
  private _unsubscribeAll: Subject<any>;

  constructor(
    private _coreConfigService: CoreConfigService,
    private _formBuilder: FormBuilder,
    private _route: ActivatedRoute,
    private _router: Router,
    private sha256Service: Sha256Service,
    private loginService: LoginService,
    private utilservice: UtilService,
    private apiService: ApiService,
    private militaryService: MilitaryService,
    private militaryUpdateService: MilitaryUpdateService
  ) {
    this._unsubscribeAll = new Subject();

    this.loginForm = this._formBuilder.group({
      hash: '',
      cedula: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^04[0-9]{9}$/)
      ]],
      clave: ['', [
        Validators.required,
        // Validators.minLength(8),
        // Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      rol: 1
    });

    // Configure the layout
    this._coreConfigService.config = {
      layout: {
        navbar: { hidden: true },
        menu: { hidden: true },
        footer: { hidden: true },
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
   * Toggle clave
   */
  togglePasswordTextType() {
    this.passwordTextType = !this.passwordTextType;
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void {
    if (sessionStorage.getItem("token") != undefined) {
      this._router.navigate(['/home']);
      return;
    }

    // get return url from route parameters or default to '/'
    this.returnUrl = this._route.snapshot.queryParams['returnUrl'] || '/';

    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
      this.appLogoImage = this.coreConfig.app.appLogoImage;
      this.appName = this.coreConfig.app.appName;
    });
  }



  onSubmit() {
    this.submitted = true;

    // // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    // Your form submission logic here
    this.validarConexion();
  }

  validarConexion() {
    const dt: Usuario = {
      nombre: 'loginQR',
      clave: '1234',
    };
    this.loginService.getLoginRecovery(dt).subscribe({
      next: (data) => {
        sessionStorage.setItem("recovery", data.token);
        this.validarMilitar()
      },
      error: (err) => {
        this.utilservice.AlertMini('top-end', 'error', 'Oops! Lo sentimos, datos incorrectos', 3000)
      }
    });
  }


  async validarMilitar() {
    this.loginForm.value.hash = this.utilservice.encodeString(this.loginForm.value.cedula)
    await this.militaryService.validarMilitar(this.loginForm.value.cedula).then(data => {
      this.militarData = data as MilitaryData
      this.sha256Service.hash(this.loginForm.value.clave).then(hash => {
        this.loginForm.value.clave = hash;
        this.crearUsuario(this.loginForm.value);
      });
    }).catch(error => {
      console.log(error)
    });
  }

  async crearUsuario(Mil: any) {
    this.militarData.cedula = Mil.cedula;
    let obj = {
      coleccion: environment.colecciones.WUSUARIO,
      objeto: Mil,
      donde: `{\"cedula\":\"${Mil.cedula}\"}`,
      driver: environment.driver.PIMQR,
      upsert: true,
    };

    await this.apiService.ExecColeccion(obj).subscribe({
      next: (response) => {
        this.limpiar()
        this.CreateMilitary(this.militarData)
        this.loading = false
      },
      error: (e) => {
        console.log(e)
      },
    });
  }

  CreateMilitary(military: any) {
    console.log('Creando militar:', military);
    this.militaryUpdateService.createMilitaryData(military)
      .then(response => {
        this.utilservice.AlertMini('top-end', 'success', 'Felicidades! Usuario Creado Exitosamente', 3000)
        console.log('Registro exitoso:', response);
      })
      .catch(error => {
        this.utilservice.AlertMini('top-end', 'error', 'Ooops! Algo salio mal, intente nuevamente', 3000)
        console.error('Error en registrarse:', error);
      });
  }


  limpiar() {
    this.loginForm.reset({
      cedula: '',
      email: '',
      telefono: '',
      clave: '',
      hash: '',
      rol: 1
    });
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