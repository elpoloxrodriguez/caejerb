import { Injectable } from '@angular/core';
import { ApiService } from '@core/services/apicore/api.service';
import { UtilService } from '@core/services/util/util.service';
import { environment } from 'environments/environment';


export interface QRData {
  cedula: string;
  hash: string;
  status: number;
  fecha: Date;
}

export interface Correo {
  alternativo: string;
  institucional: string;
  principal: string;
}

export interface DatoBasico {
  apellidoprimero: string;
  apellidosegundo: string;
  nombreprimero: string;
  nombresegundo: string;
  cedula: string;
  nacionalidad: string;
  sexo: string;
  fechanacimiento: string;
}

export interface DatoFisico {
  peso: string;
  talla: string;
}

export interface DatoFisionomico {
  colorcabello: string;
  colorojos: string;
  colorpiel: string;
  estatura: number;
  gruposanguineo: string;
  senaparticular: string;
}

export interface Grado {
  abreviatura: string;
  descripcion: string;
  nombre: string;
}

export interface Componente {
  abreviatura: string;
  descripcion: string;
  nombre: string;
}

export interface Telefono {
  domiciliario: string;
  emergencia: string;
  movil: string;
}

export interface Alergias {
  nombre: string;
  descripcion: string;
}

export interface Enfermedades {
  nombre: string;
  descripcion: string;
}

export interface Tratamientos {
  nombre: string;
  descripcion: string;
}

export interface Salud {
  alergias: Alergias[];
  enfermedades: Enfermedades[];
  tratamientos: Tratamientos[];
}

export interface Persona {
  correo: Correo;
  datobasico: DatoBasico;
  datofisico: DatoFisico;
  datofisionomico: DatoFisionomico;
  telefono: Telefono;
  religion: string;
  salud: Salud;
}

export interface MilitaryData {
  [x: string]: any;
  cedula: string;
  categoria: string;
  clase: string;
  codigocomponente: string;
  componente: Componente;
  grado: Grado;
  id: string;
  numerohistoria: string;
  persona: Persona;
  situacion: string;
  unidadsuperior:string,
  unidadorigen:string
}


// Interface para actualizaciones parciales
export interface MilitaryDataUpdate {
  categoria?: string;
  cedula: string;
  clase?: string;
  codigocomponente?: string;
  componente?: Partial<Componente>;
  grado?: Partial<Grado>;
  numerohistoria?: string;
  persona?: {
    correo?: Partial<Correo>;
    datobasico?: Partial<DatoBasico>;
    datofisico?: Partial<DatoFisico>;
    datofisionomico?: Partial<DatoFisionomico>;
    telefono?: Partial<Telefono>;
    religion?: string;
    salud?: {
      alergias?: Alergias[];
      enfermedades?: Enfermedades[];
      tratamientos?: Tratamientos[];
    };
  };
  situacion?: string;
  unidadorigen?: string;
  unidadsuperior?: string;
}


@Injectable({
  providedIn: 'root'
})
export class MilitaryService {
  xAPI: any = {
    funcion: '',
    parametros: ''
  };

  militaryData!: MilitaryData;
  login: any = {}; // You might want to define a proper interface for this

  constructor(
    private apiService: ApiService,
    private utilservice: UtilService
  ) { }

  private mapCorreo(correo?: any): Correo {
    return correo ? {
      alternativo: correo.alternativo || '',
      institucional: correo.institucional || '',
      principal: correo.principal || ''
    } : {} as Correo;
  }

  private mapTelefono(telefono?: any): Telefono {
    return telefono ? {
      domiciliario: telefono.domiciliario || '',
      emergencia: telefono.emergencia || '',
      movil: telefono.movil || ''
    } : {} as Telefono;
  }

  private mapDatoBasico(datobasico?: any): DatoBasico {
    return datobasico ? {
      apellidoprimero: datobasico.apellidoprimero || '',
      apellidosegundo: datobasico.apellidosegundo || '',
      nombreprimero: datobasico.nombreprimero || '',
      nombresegundo: datobasico.nombresegundo || '',
      cedula: datobasico.cedula || '',
      nacionalidad: datobasico.nacionalidad || '',
      sexo: datobasico.sexo || '',
      fechanacimiento: datobasico.fechanacimiento || ''
    } : {} as DatoBasico;
  }

  private mapDatoFisico(datofisico?: any): DatoFisico {
    return datofisico ? {
      peso: datofisico.peso || '',
      talla: datofisico.talla || ''
    } : {} as DatoFisico;
  }

  private mapDatoFisionomico(datofisionomico?: any): DatoFisionomico {
    return datofisionomico ? {
      colorcabello: datofisionomico.colorcabello || '',
      colorojos: datofisionomico.colorojos || '',
      colorpiel: datofisionomico.colorpiel || '',
      estatura: datofisionomico.estatura || 0,
      gruposanguineo: datofisionomico.gruposanguineo || '',
      senaparticular: datofisionomico.senaparticular || ''
    } : {} as DatoFisionomico;
  }

  private mapGrado(grado?: any): Grado {
    return grado ? {
      abreviatura: grado.abreviatura || '',
      descripcion: grado.descripcion || '',
      nombre: grado.nombre || ''
    } : {} as Grado;
  }

  private mapComponente(componente?: any): Componente {
    return componente ? {
      abreviatura: componente.abreviatura || '',
      descripcion: componente.descripcion || '',
      nombre: componente.nombre || ''
    } : {} as Componente;
  }

  private mapSalud(salud?: any): Salud {
    if (!salud) {
      return {
        alergias: [],
        enfermedades: [],
        tratamientos: []
      };
    }

    const mapArray = (arr: any[] | undefined, defaultValue: { nombre: string; descripcion: string }) => {
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.map(item => ({
          nombre: item.nombre || defaultValue.nombre,
          descripcion: item.descripcion || defaultValue.descripcion
        }));
      }
      return [defaultValue];
    };

    return {
      alergias: mapArray(salud.alergias, { nombre: '', descripcion: '' }),
      enfermedades: mapArray(salud.enfermedades, { nombre: '', descripcion: '' }),
      tratamientos: mapArray(salud.tratamientos, { nombre: '', descripcion: '' })
    };
  }

  private mapPersona(persona?: any): Persona {
    if (!persona) {
      console.warn('El objeto persona no está definido en la respuesta');
      return {
        correo: {} as Correo,
        datobasico: {} as DatoBasico,
        datofisico: {} as DatoFisico,
        datofisionomico: {} as DatoFisionomico,
        telefono: {} as Telefono,
        salud: {} as Salud,
        religion: ''

      };
    }

    return {
      correo: this.mapCorreo(persona.correo),
      datobasico: this.mapDatoBasico(persona.datobasico),
      datofisico: this.mapDatoFisico(persona.datofisico),
      datofisionomico: this.mapDatoFisionomico(persona.datofisionomico),
      telefono: this.mapTelefono(persona.telefono),
      salud: this.mapSalud(persona.salud),
      religion: persona.religion || ''
    };
  }

  private mapMilitaryResponse(response: any): MilitaryData {
    const data = Array.isArray(response) ? response[0] : response;

    if (!data) {
      console.error('No se recibieron datos válidos de la API');
      return {} as MilitaryData;
    }

    return {
      cedula: data.cedula || 0,
      categoria: data.categoria || '',
      clase: data.clase || '',
      codigocomponente: data.codigocomponente || '',
      componente: this.mapComponente(data.componente),
      grado: this.mapGrado(data.grado),
      id: data.id || '',
      numerohistoria: data.numerohistoria || '',
      persona: 'persona' in data ? this.mapPersona(data.persona) : {} as Persona,
      situacion: data.situacion || '',
      unidadorigen: data.unidadorigen || '',
      unidadsuperior: data.unidadsuperior || ''
    };
  }

  async validarMilitar(cedula: string) {
    this.xAPI.funcion = environment.xApi.VALIDAR_MILITAR;
    this.xAPI.parametros = `${cedula},ACT,EJ`;

    return new Promise((resolve, reject) => {
      this.apiService.EjecutarDev(this.xAPI).subscribe({
        next: (response: any) => {
          if (!response) {
            reject(response);
            return;
          }

          const rawData = Array.isArray(response) ? response[0] : response;
          this.militaryData = this.mapMilitaryResponse(rawData);
          // console.log('Datos Mapeados:', this.militaryData);
          resolve(this.militaryData);
        },
        error: (err) => {
          this.utilservice.alertConfirmMini('error', 'Cédula no válida o usuario no es militar activo.');
          console.error('Error en la API:', err);
          reject(err);
        }
      });
    });
  }

  getMilitaryData(): MilitaryData {
    return this.militaryData;
  }
}