import { Component, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services/apicore/api.service';
import { IAPICore } from '@core/services/apicore/api.service';
import { CoreConfigService } from '@core/services/config.service';
import { UtilService } from '@core/services/util/util.service';
import { environment } from 'environments/environment';
import { filter, map } from 'rxjs/operators';
import { LoginService, Usuario } from '../services/login.service';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss']
})
export class CertificateComponent implements OnInit {

  registroForm: FormGroup;
  openedAccordions: string[] = [];

  public xAPI: IAPICore = {
    funcion: '',
    parametros: '',
    valores: {},
  };

  public componente: string = '';
  public escudo: string = '';

  public errorMessage: string = '';
  public showErrorCard: boolean = false;
  public isLoading: boolean = true;

  public cedula
  public rowMilitar

  // Objeto para almacenar datos del dispositivo
  public deviceInfo = {
    userAgent: '',
    platform: '',
    languages: [],
    screenWidth: 0,
    screenHeight: 0,
    colorDepth: 0,
    pixelRatio: 0,
    timezone: '',
    onlineStatus: false,
    geolocation: null,
    touchSupport: false,
    deviceMemory: 0,
    hardwareConcurrency: 0,
    connection: null,
    battery: null,
    orientation: null,
    ipAddress: '',
    browser: '',
    os: '',
    deviceType: '',
    referrer: '',
    doNotTrack: false,
    cookiesEnabled: false,
    localStorageEnabled: false,
    sessionStorageEnabled: false,
    plugins: [],
    fonts: [],
    webglInfo: null,
    audioContext: null,
    cpuClass: '',
    architecture: '',
    visitTime: new Date().toISOString()
  };

  public militar = {
    foto: '',
    grado: '',
    componente: '',
    nombre: '',
    apellido: '',
    cedula: '',
    fechaNacimiento: '',
    unidadsuperior: '',
    unidadorigen: '',
    telefono: '',
    telefonoEmergencia: '',
    religion: '',
    grupoSanguineo: '',
    salud: undefined,
    escudo: ''
  }

  constructor(
    private _coreConfigService: CoreConfigService,
    private _apiService: ApiService,
    private route: ActivatedRoute,
    private utilService: UtilService,
    private loginService: LoginService
  ) {
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

  async ngOnInit() {
    // Recopilar datos del dispositivo antes de cualquier otra acción
    await this.collectDeviceInfo();

    this.route.url.pipe(
      filter(segments => segments.length > 0),
      map(segments => segments[segments.length - 1].path)
    ).subscribe(lastParam => {
      this.cedula = lastParam;
      // Enviar datos del dispositivo junto con la cédula
      this.sendDeviceAnalytics(this.cedula);
    });

    await this.consultarHashMilitar(this.cedula);
  }

  // Método para recopilar información del dispositivo
  private async collectDeviceInfo() {
    try {
      // Datos básicos del navegador
      this.deviceInfo.userAgent = navigator.userAgent;
      this.deviceInfo.platform = navigator.platform;
      this.deviceInfo.languages = [...navigator.languages];
      this.deviceInfo.browser = this.detectBrowser();
      this.deviceInfo.os = this.detectOS();
      this.deviceInfo.deviceType = this.detectDeviceType();

      // Datos de pantalla
      this.deviceInfo.screenWidth = window.screen.width;
      this.deviceInfo.screenHeight = window.screen.height;
      this.deviceInfo.colorDepth = window.screen.colorDepth;
      this.deviceInfo.pixelRatio = window.devicePixelRatio || 1;

      // Datos de conectividad
      this.deviceInfo.onlineStatus = navigator.onLine;
      this.deviceInfo.connection = this.getConnectionInfo();

      // Zona horaria
      this.deviceInfo.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Características del dispositivo
      this.deviceInfo.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this.deviceInfo.deviceMemory = (navigator as any).deviceMemory || 0;
      this.deviceInfo.hardwareConcurrency = navigator.hardwareConcurrency || 0;

      // Datos de almacenamiento
      this.deviceInfo.cookiesEnabled = navigator.cookieEnabled;
      this.deviceInfo.localStorageEnabled = this.testLocalStorage();
      this.deviceInfo.sessionStorageEnabled = this.testSessionStorage();

      // Plugins y fuentes
      this.deviceInfo.plugins = this.getBrowserPlugins();
      this.deviceInfo.fonts = await this.detectFonts();

      // WebGL y capacidades multimedia
      this.deviceInfo.webglInfo = this.getWebGLInfo();
      this.deviceInfo.audioContext = this.getAudioContextInfo();

      // Datos de privacidad
      this.deviceInfo.doNotTrack = navigator.doNotTrack === '1' || (typeof (window as any)['doNotTrack'] !== 'undefined' && (window as any)['doNotTrack'] === '1');

      // Referrer
      this.deviceInfo.referrer = document.referrer;

      // Intentar obtener geolocalización (requiere permiso)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.deviceInfo.geolocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
          },
          error => {
            this.deviceInfo.geolocation = { error: error.message };
          }
        );
      }

      // Intentar obtener información de la batería (solo en algunos navegadores)
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then(battery => {
          this.deviceInfo.battery = {
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          };
        });
      }

      // Orientación del dispositivo
      this.deviceInfo.orientation = this.getOrientation();

      // Detectar arquitectura y clase de CPU
      this.deviceInfo.cpuClass = (navigator as any).cpuClass || 'unknown';
      this.deviceInfo.architecture = this.detectArchitecture();

      // console.log('Datos del dispositivo recopilados:', this.deviceInfo);
    } catch (error) {
      console.error('Error al recopilar datos del dispositivo:', error);
    }
  }

  // Métodos auxiliares para detectar características específicas
  private detectBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('SamsungBrowser')) return 'Samsung Browser';
    if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
    if (userAgent.includes('Trident')) return 'Internet Explorer';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  private detectOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPhone')) return 'iOS';
    if (userAgent.includes('iPad')) return 'iOS';
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac OS')) return 'Mac OS';
    if (userAgent.includes('Linux')) return 'Linux';
    return 'Unknown';
  }

  private detectDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
      return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
      return 'Mobile';
    }
    return 'Desktop';
  }

  private getConnectionInfo(): any {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      return {
        downlink: connection.downlink,
        effectiveType: connection.effectiveType,
        rtt: connection.rtt,
        saveData: connection.saveData,
        type: connection.type
      };
    }
    return null;
  }

  private testLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private testSessionStorage(): boolean {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private getBrowserPlugins(): any[] {
    return Array.from(navigator.plugins).map(plugin => ({
      name: plugin.name,
      filename: plugin.filename,
      description: plugin.description,
      length: plugin.length
    }));
  }

  private async detectFonts(): Promise<string[]> {
    // Implementación simplificada de detección de fuentes
    const fonts = [
      'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New',
      'Georgia', 'Impact', 'Times New Roman', 'Trebuchet MS',
      'Verdana', 'Webdings'
    ];

    const availableFonts = [];

    // Usamos canvas para verificar fuentes
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const text = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const defaultWidth = context.measureText(text).width;

    for (const font of fonts) {
      context.font = `12px "${font}"`;
      if (context.measureText(text).width !== defaultWidth) {
        availableFonts.push(font);
      }
    }

    return availableFonts;
  }

  private getWebGLInfo(): any {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (!gl) return null;

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        vendor: debugInfo ? gl.getParameter((debugInfo as any).UNMASKED_VENDOR_WEBGL) : 'unknown',
        renderer: debugInfo ? gl.getParameter((debugInfo as any).UNMASKED_RENDERER_WEBGL) : 'unknown',
        version: gl.getParameter(gl.VERSION)
      };
    } catch (e) {
      return null;
    }
  }

  private getAudioContextInfo(): any {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return null;

      const context = new AudioContext();
      return {
        sampleRate: context.sampleRate,
        state: context.state,
        numberOfChannels: context.destination.maxChannelCount
      };
    } catch (e) {
      return null;
    }
  }

  private getOrientation(): any {
    if (window.screen.orientation) {
      return {
        type: window.screen.orientation.type,
        angle: window.screen.orientation.angle
      };
    } else if ((window as any).orientation !== undefined) {
      return {
        type: (window as any).orientation === 0 ? 'portrait-primary' : 'landscape-primary',
        angle: (window as any).orientation
      };
    }
    return null;
  }

  private detectArchitecture(): string {
    try {
      // Detectar arquitectura basada en características del navegador
      const platform = navigator.platform.toLowerCase();
      if (platform.includes('win')) return 'Windows';
      if (platform.includes('mac')) return 'Mac';
      if (platform.includes('linux')) return 'Linux';
      if (platform.includes('iphone') || platform.includes('ipad')) return 'ARM (iOS)';
      if (platform.includes('android')) return 'ARM (Android)';

      // Detectar si es 32 o 64 bits (no muy confiable)
      const userAgent = navigator.userAgent;
      if (userAgent.includes('WOW64') || userAgent.includes('Win64')) return 'x64';
      if (userAgent.includes('Linux x86_64')) return 'x64';
      return 'unknown';
    } catch (e) {
      return 'unknown';
    }
  }


  // Método para enviar datos analíticos al servidor
  private sendDeviceAnalytics(cedula: string) {
    const analyticsData = {
      cedula: cedula,
      deviceInfo: this.deviceInfo,
      timestamp: new Date().toISOString()
    };

    const dt: Usuario = {
      nombre: 'loginQR',
      clave: '1234',
    };
    this.loginService.getLoginRecovery(dt).subscribe({
       next: async (data) => {
        sessionStorage.setItem("recovery", data.token);

        // Aquí puedes implementar el envío al servidor
        console.log('Datos analíticos a enviar:', analyticsData);
        let obj = {
          coleccion: environment.colecciones.ANALITICOS,
          objeto: analyticsData,
          donde: `{\"cedula\":\"${analyticsData.cedula}\"}`,
          driver: environment.driver.PIMQR,
          upsert: true,
        };

        await this._apiService.ExecColeccion(obj).subscribe({
          next: (response) => {
            console.log(response)
          },
          error: (e) => {
            console.log(e)
          },
        });

      },
      error: (err) => {
        console.log(err)
      }
    });
  }


  noArrastrar(event: DragEvent) {
    event.preventDefault();
  }

  toggleAccordion(id: string) {
    if (this.isAccordionOpen(id)) {
      this.openedAccordions = this.openedAccordions.filter(item => item !== id);
    } else {
      this.openedAccordions.push(id);
    }
  }

  isAccordionOpen(id: string): boolean {
    return this.openedAccordions.includes(id);
  }

  async consultarHashMilitar(hash: string) {
    this.isLoading = true;
    this.showErrorCard = false;
    this.xAPI.funcion = environment.xApi.CONSULTARHASH;
    this.xAPI.parametros = `${hash}`;

    return new Promise(async (resolve, reject) => {
      await this._apiService.EjecutarDev(this.xAPI).subscribe({
        next: async (response: any) => {
          if (!response) {
            this.errorMessage = 'La API respondió con null/undefined';
            this.showErrorCard = true;
            this.isLoading = false;
            reject(this.errorMessage);
            return;
          }

          if (!Array.isArray(response) || response.length === 0) {
            this.errorMessage = 'El hash no existe o no tiene datos asociados';
            this.showErrorCard = true;
            this.isLoading = false;
            reject(this.errorMessage);
            return;
          }

          if (!response[0].cedula) {
            this.errorMessage = 'El hash no contiene cédula válida';
            this.showErrorCard = true;
            this.isLoading = false;
            reject(this.errorMessage);
            return;
          }

          try {
            await this.ConsultarMilitar(response[0].cedula);
            this.isLoading = false;
            resolve(response);
          } catch (error) {
            this.errorMessage = 'Error al consultar datos del militar';
            this.showErrorCard = true;
            this.isLoading = false;
            reject(error);
          }
        },
        error: (err) => {
          this.errorMessage = 'Error en la conexión con el servidor';
          this.showErrorCard = true;
          this.isLoading = false;
          reject(err);
        }
      });
    });
  }

  async ConsultarMilitar(cedula: string) {
    this.xAPI.funcion = environment.xApi.OBTENERMILITAR;
    this.xAPI.parametros = `${cedula}`;

    return new Promise(async (resolve, reject) => {
      this._apiService.EjecutarDev(this.xAPI).subscribe({
        next: async (response: any) => {
          if (!response || !response[0] || !response[0].cedula) {
            reject('Hash no válido');
            return;
          }
          this.rowMilitar = response[0];
          this.militar = {
            foto: `https://app.ipsfa.gob.ve/sssifanb/afiliacion/temp/${this.rowMilitar.cedula}/foto.jpg`,
            grado: this.rowMilitar.grado.descripcion,
            componente: this.rowMilitar.componente.descripcion,
            nombre: this.rowMilitar.persona.datobasico.nombreprimero,
            apellido: this.rowMilitar.persona.datobasico.apellidoprimero,
            cedula: this.rowMilitar.cedula,
            fechaNacimiento: '',
            unidadsuperior: this.rowMilitar.unidadsuperior,
            unidadorigen: this.rowMilitar.unidadorigen,
            telefono: this.rowMilitar.persona.telefono.movil,
            telefonoEmergencia: this.rowMilitar.persona.telefono.emergencia ? this.rowMilitar.persona.telefono.emergencia : this.rowMilitar.persona.telefono.domiciliario,
            religion: this.rowMilitar.persona.religion,
            grupoSanguineo: this.rowMilitar.persona.datofisionomico.gruposanguineo,
            salud: this.rowMilitar.persona.salud,
            escudo: ''
          };
          switch (this.rowMilitar.componente.abreviatura) {
            case 'EJ':
              this.escudo = './assets/images/componentes/EJ.webp';
              break;
            case 'AR':
              this.escudo = './assets/images/componentes/AR.webp';
              break;
            case 'AV':
              this.escudo = './assets/images/componentes/AV.webp';
              break;
            case 'GN':
              this.escudo = './assets/images/componentes/GN.webp';
              break;
            case 'Milicia':
              this.escudo = './assets/images/componentes/MB.webp';
              break;
            default:
              this.componente = '';
              break;
          }

            if (cedula == '5892464') {
            this.militar.foto = './assets/images/presidente.jpg';
            this.militar.componente = 'Comandante en Jefe de la Fuerza Armada Nacional Bolivariana';
            this.escudo = './assets/images/fanb.png';
          }

          resolve(response);
        },
        error: (err) => {
          console.error('Error en la API:', err);
          reject(err);
        }
      });
    });
  }
}