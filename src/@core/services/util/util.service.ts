import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import {Md5} from 'ts-md5/dist/md5';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

   private fechaNacimiento: Date | string;
   private cedula: string

  //
  constructor(
  ) {

  }

// ENCRYPTAR EN BASE64+ROT13+SHA256
  encodeString(input: string): string {
    // Paso 1: Codificar a Base64
    const base64 = btoa(unescape(encodeURIComponent(input)));
    
    // Paso 2: Aplicar ROT13
    const rot13 = this.applyRot13(base64);
    
    // Paso 3: Codificar a SHA256
    const sha256 = CryptoJS.SHA256(rot13).toString(CryptoJS.enc.Hex);
    
    return sha256;
  }

  private applyRot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, function(c) {
      const charCode = c.charCodeAt(0);
      const shift = charCode <= 90 ? 65 : 97;
      return String.fromCharCode((charCode - shift + 13) % 26 + shift);
    });
  }


  

   FechaFormato(texto){
    return texto.replace(/^(\d{4})-(\d{2})-(\d{2})$/g,'$3/$2/$1');
  }

  GenerarUnicId () : string {
    return Math.random().toString(36).substr(2, 18);
  }


  /**
   * Fecha Actual del sistema desde la application
   * @param dias sumar dias a la fecha actual 
   * @returns retorna la fecha actual del sistema en formato YYYY-MM-DD
   */
  FechaActual(dias: number = 0): string {
    let date = new Date()

    if (dias > 0) date.setDate(date.getDate() + dias)

    let output = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
    return output
  }
  //retorna fecha en formato Dia/Mes/Anio
  ConvertirFecha(fecha: any): string {
    return fecha.year + '-' + + fecha.month + '-' + fecha.day
  }

  FechaMomentActual(){
    moment.locale('es')
    var fech = moment().format('DD MMMM YYYY  hh:mm:ss a')
    return fech
  }

  FechaMoment(fecha: any) {
    moment.locale('es')
    var fech = moment(fecha).format('LLLL')
    return fech
  }

  FechaMomentLL(fecha: any) {
    moment.locale('es')
    var fech = moment(fecha).format('LL')
    return fech
  }

  FechaMomentL(fecha: any) {
    moment.locale('es')
    var fech = moment(fecha).format('L')
    return fech
  }

  FechaMomentLLL(fecha: any) {
    moment.locale('es')
    var fech = moment(fecha).format('L')
    return fech
  }

  md5(pwd: any) {
    const md5 = new Md5();
    const password =  md5.appendStr(pwd).end()
    return password
  }

  TokenAleatorio(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() *
        charactersLength));
    }
    return result;
  }




  ConvertirMoneda(moneda: any) {
    const formatter = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VEF' }).format(moneda)
    return formatter
  }

  ConvertirMonedaSola(moneda: any) {
    const formatter = new Intl.NumberFormat('es-VE', { maximumFractionDigits: 2, }).format(moneda)
    return formatter
  }

  ConvertirMoneda$(moneda: any) {
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(moneda)
    return formatter
  }

  RevertirConvertirMoneda(moneda: any) {
    let TotalDevengado = moneda.replace(/,/g, "");
    return TotalDevengado
  }

  alertConfirmMini(icon, title) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    Toast.fire({
      icon: icon,
      title: title
    })
  }


  alertMessageAutoCloseTimer(timer, title, html) {
    let timerInterval
    Swal.fire({
      title: title,
      html: html,
      timer: timer,
      imageUrl: 'assets/images/logos/ipostel.png',
      imageWidth: 250,
      imageHeight: 100,
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      timerProgressBar: true,
      didOpen: () => {
        // Swal.showLoading()
        const b = Swal.getHtmlContainer().querySelector('b')
        timerInterval = setInterval(() => {
          // b.textContent = Swal.getTimerLeft()
        }, 100)
      },
      willClose: () => {
        clearInterval(timerInterval)
      }
    }).then((result) => {
      /* Read more about handling dismissals below */
      if (result.dismiss === Swal.DismissReason.timer) {
        console.log('I was closed by the timer')
      }
    })
  }


    /**
   * Calcula el tiempo de servicio y suma el tiempo reconocido
   * @param {Date|string} fechaActual - Fecha de referencia
   * @param {Date|string} fechaIngreso - Fecha de ingreso
   * @param {Object} tiempoReconocido - Objeto con anios, meses y días reconocidos
   * @returns {Object} Objeto con tiempo total calculado y tiempo de servicio formateado
   */
  calcularTiempoServicioCompleto(fechaActual, fechaIngreso, tiempoReconocido = { anios: 0, meses: 0, dias: 0 }) {
    // 1. Calcular tiempo de servicio base (sin tiempo reconocido)
    const tiempoBase = this.calcularTiempoServicio(fechaActual, fechaIngreso);

    // 2. Sumar el tiempo reconocido (siguiendo la lógica de Go)
    let { anios, meses, dias } = this.sumarTiempoReconocido(tiempoBase, tiempoReconocido);

    // 3. Formatear el resultado como en Go
    const tiempoServicioFormateado = `${anios}A ${meses}M ${dias}D`;

    return {
      tiempoTotal: { anios, meses, dias },
      tiempoBase,
      tiempoReconocido,
      tiempoServicioFormateado
    };
  }


    setFechaNacimiento(fecha: Date | string): void {
    this.fechaNacimiento = fecha
  }


    setCedula(cedula: string): void {
    this.cedula = cedula
  }

    /**
  * Suma el tiempo reconocido al tiempo base (lógica adaptada de Go)
  */
  sumarTiempoReconocido(tiempoBase, { anios: ar, meses: mr, dias: dr }) {
    let { anios, meses, dias } = tiempoBase;

    // Sumar anios reconocidos
    anios += ar;

    // Sumar meses reconocidos con ajustes
    if (dr > 29) {
      dias += dr - 30;
      meses++;
    } else {
      dias += dr;
    }

    if (mr > 11) {
      meses += mr - 12;
      anios++;
    } else {
      meses += mr;
    }

    // Ajustes finales (como en Go)
    if (ar > 0 || mr > 0 || dr > 0) {
      if (dias > 29) {
        dias -= 30;
        meses++;
      }
      if (meses > 11) {
        meses -= 12;
        anios++;
      }
    }

    return { anios, meses, dias };
  }


    normalizarFechaUTC(fecha: string | Date): Date {
    if (!fecha) return new Date(NaN);

    // Si es string con offset de zona horaria
    if (typeof fecha === 'string' && /[-+]\d{2}:\d{2}$/.test(fecha)) {
      // Convertir a UTC eliminando el offset
      const dateObj = new Date(fecha);
      const utcDate = new Date(dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000));
      return utcDate;
    }

    // Si ya es Date o string ISO sin zona horaria
    return new Date(fecha);
  }


    // Función original mejorada (para usar como base)
  calcularTiempoServicio(fechaActual, fechaIngreso) {
    let fechaActualUTC = this.normalizarFechaUTC(fechaActual)
    let fechaIngresoUTC = this.normalizarFechaUTC(fechaIngreso)


    if (isNaN(fechaActualUTC.getTime()) || isNaN(fechaIngresoUTC.getTime())) {
      throw new Error('Fechas inválidas');
    }

    if (fechaIngresoUTC > fechaActualUTC) {
      [fechaActualUTC, fechaIngresoUTC] = [fechaIngresoUTC, fechaActualUTC];
    }

    let anios = fechaActualUTC.getUTCFullYear() - fechaIngresoUTC.getUTCFullYear();
    let meses = fechaActualUTC.getUTCMonth() - fechaIngresoUTC.getUTCMonth();
    let dias = fechaActualUTC.getUTCDate() - fechaIngresoUTC.getUTCDate();

    if (dias < 0) {
      const ultimoDiaMesAnterior = new Date(Date.UTC(
        fechaActualUTC.getUTCFullYear(),
        fechaActualUTC.getUTCMonth(),
        0
      )).getUTCDate();

      dias = ultimoDiaMesAnterior - fechaIngresoUTC.getUTCDate() + fechaActualUTC.getUTCDate();
      meses--;
    }

    if (meses < 0) {
      meses += 12;
      anios--;
    }

    return { anios, meses, dias };
  }

  AlertMini(position:any,icon:any,title:any,timer:number){
    const Toast = Swal.mixin({
      toast: true,
      position: position,
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
    
    Toast.fire({
      icon: icon,
      title: title
    })
  }


  Semillero(id: string): string {
    var f = new Date()
    var anio = f.getFullYear().toString().substring(2, 4)
    var mes = this.zfill((f.getMonth() + 1).toString(), 2)
    var dia = this.zfill(f.getDate().toString(), 2)
    return anio + mes + dia + '-' + this.zfill(id, 5)
  }

  public zfill(number, width) {
    var numberOutput = Math.abs(number); /* Valor absoluto del número */
    var length = number.toString().length; /* Largo del número */
    var zero = "0"; /* String de cero */

    if (width <= length) {
      if (number < 0) {
        return ("-" + numberOutput.toString());
      } else {
        return numberOutput.toString();
      }
    } else {
      if (number < 0) {
        return ("-" + (zero.repeat(width - length)) + numberOutput.toString());
      } else {
        return ((zero.repeat(width - length)) + numberOutput.toString());
      }
    }


  }

  //convertir cadena a minuscula y sin carateres especiales
  ConvertirCadena(cadena: string): string {
    return cadena.toLowerCase().replace(/á/g, "a").replace(/ê/g, "i").replace(/í/g, "i").replace(/ó/g, "o").replace(/ú/g, "u")
  }



  diferenciaFecha(fecha1: string, fecha2: string) {
    let fecha = moment(fecha2).diff(fecha1, 'days')
    return fecha
  }

}
