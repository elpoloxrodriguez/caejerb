import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { LoginService, Usuario } from './login.service';
import { UtilService } from '@core/services/util/util.service';
import { MilitaryData, MilitaryDataUpdate } from './military.service';
import { environment } from 'environments/environment';
import { ApiService } from '@core/services/api.service';
import { ApiService as ApiCoreService } from '@core/services/apicore/api.service';

@Injectable({
  providedIn: 'root'
})
export class MilitaryUpdateService {
  private token: any;
  private xAPI: any = {
    funcion: '',
    parametros: ''
  };

  constructor(
    private loginService: LoginService,
    private utilservice: UtilService,
    private _apiService: ApiCoreService
  ) {
    this.initializeToken();
  }

  private initializeToken(): void {
    const tokenString = sessionStorage.getItem('token');
    if (tokenString) {
      this.token = jwt_decode(tokenString);
    }
  }

  /**
   * Método principal para actualizar datos militares de forma parcial
   * @param cedula Cédula del militar a actualizar
   * @param updates Objeto con los campos a actualizar
   * @returns Promise con el resultado de la operación
   */
  async updateMilitaryData(cedula: string, updates: MilitaryDataUpdate): Promise<any> {
    console.log('Actualizando datos militares para:', cedula, 'con cambios:', updates);
    try {
      // 1. Validar conexión
      await this.validarConexion();
      
      // 2. Obtener datos actuales del militar
      const currentData = await this.ConsultarMilitar(cedula);
      
      // 3. Fusionar cambios con datos existentes
      const updatedData = this.mergeUpdates(currentData, updates);
      // 4. Enviar actualización
      return this.crearMilitar(updatedData);
    } catch (error) {
      console.error('Error en updateMilitaryData:', error);
      throw error;
    }
  }


  async createMilitaryData(military:any): Promise<any> {
    console.log('Creando datos militares para:');
    try {
      // 1. Validar conexión
      await this.validarConexion();
      
      return await this.crearMilitar(military);
    } catch (error) {
      console.error('Error en createMilitaryData:', error);
      throw error;
    }
  }



  public validarConexion(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const dt: Usuario = {
        nombre: 'loginQR',
        clave: '1234',
      };
      
      await this.loginService.getLoginRecovery(dt).subscribe({
        next: (data) => {
          sessionStorage.setItem("recovery", data.token);
          resolve();
        },
        error: (err) => {
          this.utilservice.AlertMini('top-end', 'error', 'Oops! Lo sentimos, datos incorrectos', 3000);
          reject(err);
        }
      });
    });
  }

  public ConsultarMilitar(cedula: string): Promise<MilitaryData> {
    this.xAPI.funcion = environment.xApi.OBTENERMILITAR;
    this.xAPI.parametros = `${cedula}`;

    return new Promise( (resolve, reject) => {
       this._apiService.Ejecutar(this.xAPI).subscribe({
        next: (response: any) => {
          if (!response || !response[0]) {
            reject('La API respondió con null/undefined');
            return;
          }
          resolve(response[0]);
        },
        error: (err) => {
          console.error('Error en la API:', err);
          reject(err);
        }
      });
    });
  }

  private crearMilitar(Militar: MilitaryData): Promise<any> {
    return new Promise((resolve, reject) => {
      let obj = {
        coleccion: environment.colecciones.MILITAR,
        objeto: Militar,
        donde: `{\"cedula\":\"${Militar.cedula}\"}`,
        driver: environment.driver.PIMQR,
        upsert: true,
      };

      this._apiService.ExecColeccion(obj).subscribe({
        next: (response) => resolve(response),
        error: (e) => reject(e),
      });
    });
  }

  /**
   * Fusiona los cambios parciales con los datos existentes del militar
   * @param currentData Datos actuales del militar
   * @param updates Cambios parciales a aplicar
   * @returns Objeto completo con los cambios aplicados
   */
  private mergeUpdates(currentData: MilitaryData, updates: MilitaryDataUpdate): MilitaryData {
    // Creamos un deep copy de los datos actuales para no modificar el original
    const mergedData: MilitaryData = JSON.parse(JSON.stringify(currentData));

    // Aplicamos las actualizaciones de primer nivel
    if (updates.categoria) mergedData.categoria = updates.categoria;
    if (updates.cedula) mergedData.cedula = updates.cedula;
    if (updates.clase) mergedData.clase = updates.clase;
    if (updates.codigocomponente) mergedData.codigocomponente = updates.codigocomponente;
    if (updates.numerohistoria) mergedData.numerohistoria = updates.numerohistoria;
    if (updates.situacion) mergedData.situacion = updates.situacion;
    if (updates.unidadorigen) mergedData.unidadorigen = updates.unidadorigen;
    if (updates.unidadsuperior) mergedData.unidadsuperior = updates.unidadsuperior;

    // Aplicamos actualizaciones anidadas
    if (updates.componente) {
      mergedData.componente = { ...mergedData.componente, ...updates.componente };
    }

    if (updates.grado) {
      mergedData.grado = { ...mergedData.grado, ...updates.grado };
    }

    if (updates.persona) {
      if (!mergedData.persona) mergedData.persona = {} as any;
      
      if (updates.persona.correo) {
        mergedData.persona.correo = { ...mergedData.persona.correo, ...updates.persona.correo };
      }
      
      if (updates.persona.datobasico) {
        mergedData.persona.datobasico = { ...mergedData.persona.datobasico, ...updates.persona.datobasico };
      }
      
      if (updates.persona.datofisico) {
        mergedData.persona.datofisico = { ...mergedData.persona.datofisico, ...updates.persona.datofisico };
      }
      
      if (updates.persona.datofisionomico) {
        mergedData.persona.datofisionomico = { ...mergedData.persona.datofisionomico, ...updates.persona.datofisionomico };
      }
      
      if (updates.persona.telefono) {
        mergedData.persona.telefono = { ...mergedData.persona.telefono, ...updates.persona.telefono };
      }
      
      if (updates.persona.religion !== undefined) {
        mergedData.persona.religion = updates.persona.religion;
      }
      
      if (updates.persona.salud) {
        if (!mergedData.persona.salud) mergedData.persona.salud = { alergias: [], enfermedades: [], tratamientos: [] };
        
        if (updates.persona.salud.alergias) {
          mergedData.persona.salud.alergias = [...(mergedData.persona.salud.alergias || []), ...updates.persona.salud.alergias];
        }
        
        if (updates.persona.salud.enfermedades) {
          mergedData.persona.salud.enfermedades = [...(mergedData.persona.salud.enfermedades || []), ...updates.persona.salud.enfermedades];
        }
        
        if (updates.persona.salud.tratamientos) {
          mergedData.persona.salud.tratamientos = [...(mergedData.persona.salud.tratamientos || []), ...updates.persona.salud.tratamientos];
        }
      }
    }

    return mergedData;
  }
}