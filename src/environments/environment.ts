// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.

import { create } from "domain";

// The list of which env maps to which file can be found in `.angular-cli.json`.
export const environment = {
  production: false,
  id : 'ID-001',
  url: 'https://localhost',
  imageUrl: 'https://app.ipsfa.gob.ve/sssifanb/afiliacion/temp/',
  api: '/v1/api/',
   hmr: false,
  cache: false,
    recaptcha: {
    siteKey: '6LdwJNwlAAAAAI8-p7XKKCtfJ51goRFyBBbjaAJL', // LOCALHOST Y SIRPVEN V2
  },
  buildDateTime: 'Sat Jun 14 2025 19:37:53 GMT-0400 (Venezuela Time)',
  devel: '/devel/api/',
  fnx: '/v1/api/fnx',
  coleccion: '/v1/api/ccoleccion',
  subirarchivos: '/v1/api/subirarchivosdinamicos',
  hash: ':1c22923624eb51668131092add9d78d0.sse',
  path: 'crud:',
  modo: 'ejercito',
  rutaQR: {
    'ipsfa': btoa('https://apps.ipsfa.gob.ve/app/#/certificado'),
    'ejercito': btoa('https://app.ejercito.mil.ve/#/certificado'),
  },
  serviciosExtra: false,
  driver: {
    PRINCIPAL : 'MGDBA',
    PIMQR: 'PIMQR'
  },
  colecciones: {
    WUSUARIO : 'wusuario',
    MILITAR: 'militar'
  },
  
  xApi: {
    REGISTAR_USUARIO: 'PIM_C_REGISTRAR_USUARIO',
    INICIAR_SESION: 'PIM_R_INICIAR_SESION',

    OBTENERMILITAR: 'PIM_R_OBTENERMILITAR',
    CONSULTARHASH: 'PIM_R_CONSULTARHASH',

    PHONE: {
      create: 'PIM_C_PHONE_CREATE',
      update: 'PIM_C_PHONE_UPDATE',
      delete: 'PIM_C_PHONE_DELETE',
      list: 'PIM_R_PHONE_LIST',
    },

    
    MILITAR: 'EJB_CMilitar',
    NETO_TITULAR: 'FANB_CNetosTitular',
    NETO_FAMILIAR: 'FANB_CNetosFamiliar',
    CONSULTAR_NETOS : 'EJB_R_NetosMilitar',
    PENSION: 'FANB_CPension',
    CONSTANCIA_TRABAJO: 'EJB_R_SueldoMilitar',
    NOMINA_CONCEPTOS: 'FANB_CNominaConceptos',
    NOMINA_ARC : 'FANB_CNominaARC',
    CONSULTA_ARC: 'EJB_R_ArcMilitar',
    RECUPERAR_EMAIL: 'EJB_CCorreo',
    VALIDAR_MILITAR: 'FANB_CIdentificarMilitar',
    VALIDAR_USUARIO: 'FANB_CIdentificarUsuario',
    INSERTAR_QR: 'FANB_InsertarQR',
    CONSULTAR_QR: 'FANB_ConsultarQR',
    VALIDAR_EMAIL: '_SYS_MailPasswordRecovery',
    VALIDAR_URL : '_SYS_CSeguridadRecuperar',
    CONSULTAR_TOKEN: '_SYS_CRecuperarCorreo',
    CAMBIO_CLAVE: '_SYS_CCambioClave',
    CHATBOT: 'ChatBot',
    CONDECORACIONES_MILITAR: 'EJB_R_Personal_Condecoraciones',// API para consultar condecoraciones de un militar
    CURRICULUM: 'EJB_R_Curriculum'
  },
  
  functions: {
    ENVIAR_EMAIL: 'Fnx_EnviarMailCurl',
    ENVIAR_EMAIL_VALIDAR: 'Fnx_EnviarMailValidar',
    ENVIAR_REPORTE_EMAIL: 'Fnx_EnviarCorreoPDF',
    IMAGEN_BASE64: 'Fnx_ImgBase64Url'
  },

  services:{
    GENERAR_QR: '/v1/api/genqr-libre/',
    CONVERTIR_BASE64: '/v1/api/imgslocalbase64/',
  },

  subPath: {
    LOGIN: 'ipsfa/api/web/loginWsx',
    RECOVERY: 'wusuario/login'
  }
};
