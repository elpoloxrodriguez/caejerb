
export interface Militar {
    nombres?: string;
    apellidos?: string;
    foto?: string;
    cedula?: string;
    
    sexo?: string;
    fechaNacimiento?: string | Date;
    estadoCivil?: string;
    ordenDeMerito?: string;
    situacionMilitar?: string;
    numeroResolucion?: string;
    fechaResolucion?: string | Date;

    compAbreviatura?: string;
    componente?: string;
    grado?: string;
    gradoAbr?: string;
    fotoGrado?: string;
    categoria?: string;
    clasificacion?: string;
    fechaGraduacion?: string | Date;
    ultimoAscenso?: string;
    tiempoDeServicio: string;
    codigoComponente: string;
    vencimientoCarnet: string | Date;
    creacionCarnet: string | Date;
    fechaDeDefuncion? :string | Date;
    montoPension?: string;

    trabajo?: {
        sector: string;
        dependencia: string;
        cargo: string;
    }

    direccion?: Direccion[]
    datosFisicos?: DatosFisicos
    banco?: Banco[]
    salud?: Salud;

    uniforme?: Uniforme;
    arma?: Arma;
}

export interface Banco {
    nombre: string;
    codigo: string;
    tipo: string;
    numeroCuenta: string;
    numeroCuentoSinFormato?: string;
}

export interface Direccion {
    estado: any;
    municipio: string;
    avenida: string;
    ciudad: string;
    parroquia: string;
    casa: string;
    telefono: string;
    telefonoLocal: string;
    correo?: string;
    instagram?: string;
    celular?: string
    zonaPostal?: string;
}

export interface DatosFisicos {
    estatura: any;
    talla: string;
    colorPiel: string;
    colorCabello: string;
    peso: string;
    tipoSangre: string;
    colorOjos: string;
    senaParticular: string
}

export interface Salud{
    enfermedades?: Enfermedad[];
    alergias?: Alergia[];
    tratamientos?: Tratamiento[];
}

export interface Enfermedad{
    nombre: string;
    descripcion?: string;
}

export interface Alergia {
    nombre: string;
    descripcion?: string;
}

export interface Tratamiento {
    nombre: string;
    descripcion?: string;
}

export interface Uniforme {
    zapatos: string
    pantalon: string;
    camisa: string;
    botas: string;
    gorra: string;
    ultDotacion: string;
}

export interface Arma {
    tipo: string;
    marca: string;
    modelo: string;
    numeroSerial: string;
    calibre: string;
}