import {HttpClient, HttpHeaders, HttpParams, HttpRequest} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private _Url: string = environment.api;
  private _Dev: string = environment.devel;
  private _Fnx: string = environment.fnx;
  private _SAr: string = environment.subirarchivos;
  private _Col: string = environment.coleccion;
  private _Api: string = environment.path + environment.hash;

  constructor(private _httpClient: HttpClient) {}

  getToken(): any {
    let token = sessionStorage.getItem("token")
    if (token) {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload); 
    }
  }

  GenQR(
    id: string,
    ruta: string,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<any> {
    return this._httpClient.get<any>(
      environment.services.GENERAR_QR + id + "/" + ruta,
      this._getOptions(params, headers)
    );
  }

  LoadQR(id: string): Observable<any> {
    // return this.http.get<any>(this.URL + 'imgslocalbase64/' + id, this.httpOptionsQR)
    return this._httpClient.get<any>(
      "/v1/api/imgslocalbase64/" + id,
      this.httpOptionsQR
    );
  }

  getBlob(): Observable<Blob> {
    const path = this._getPath();
    return this._httpClient.get(path, { responseType: "blob" });
  }

  getFile() {
    const path = this._getPath();
    return this._httpClient.get(path, { responseType: "blob" });
  }

  public getOne<MODEL>(
    url: string,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<MODEL> {
    const path = this._getPath();
    return this._httpClient
      .get<MODEL>(path, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }

  public getAll<MODEL>(
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<MODEL[]> {
    const path = this._getPath();
    return this._httpClient
      .get<MODEL[]>(path, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }

  public post<MODEL, RESPONSE>(
    body: MODEL,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<RESPONSE> {
    const path = this._getPath();
    return this._httpClient
      .post<RESPONSE>(path, body, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }
  public postColeccion<MODEL, RESPONSE>(
    body: MODEL,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<RESPONSE> {
    const path = this._getPathColeccion();
    return this._httpClient
      .post<RESPONSE>(path, body, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }

  public postDev<MODEL, RESPONSE>(
    body: MODEL,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<RESPONSE> {
    const path = `${this._Dev}${this._Api}`;
    return this._httpClient
      .post<RESPONSE>(path, body, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }

  public postFnx<MODEL, RESPONSE>(
    body: MODEL,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<RESPONSE> {
    const path = this._getPathFnx();
    return this._httpClient
      .post<RESPONSE>(path, body, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }

  public postLogin<MODEL, RESPONSE>(
    path: any,
    body: MODEL,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<RESPONSE> {
    const uri = this._getPathLogin(path);
    return this._httpClient
      .post<RESPONSE>(uri, body, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }

  public put<MODEL, RESPONSE>(
    url: string,
    body: MODEL,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<RESPONSE> {
    const path = this._getPath();
    return this._httpClient
      .put<RESPONSE>(path, body, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }
  
  //EnviarArchivos generales
  public EnviarArchivos(frm: FormData): Observable<any> {
    var httpOptions = {
      headers: new HttpHeaders({
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      }),
    };
    
    return this._httpClient.post<any>(this._SAr, frm, this.httpOptionsQR);
  }

  subir(formData: any) {
    const req = new HttpRequest('POST', environment.subirarchivos, formData, {
      reportProgress: true
    });
    return this._httpClient.request(req);    
  }

  //EnviarArchivos generales
  SubirReporte(frm: FormData): Observable<any> {
    var httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      })
    };
    return this._httpClient.post<any>(environment.subirarchivos, frm, httpOptions);
  }

  public delete<RESPONSE>(
    url: string,
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Observable<RESPONSE> {
    const path = this._getPath();
    return this._httpClient
      .delete<RESPONSE>(path, this._getOptions(params, headers))
      .pipe(catchError((error: any) => this._handleError(this, error)));
  }

  private _handleError(_parent: ApiService, error: any): Observable<never> {
    return throwError(() => new Error(error));
  }

  private httpOptionsQR = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      // Authorization: "Bearer " + sessionStorage.getItem("token"),
    }),
  };


  private _getOptions(
    params:
      | HttpParams
      | {
          [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        }
      | null = null,
    headers: HttpHeaders | { [header: string]: string | string[] } | null = null
  ): Options {
    const options: Options = {};
    if (params != null) {
      options.params = params;
    }
    if (headers != null) {
      options.headers = headers;
    }
    return options;
  }

  private _getPath(): string {
    let path: string;
    path = `${this._Url}${this._Api}`;
    return path;
  }

  private _getPathColeccion(): string {
    let path: string;
    path = `${this._Col}`;
    return path;
  }

  private _getPathFnx(): string {
    let path: string;
    path = `${this._Fnx}`;
    return path;
  }

  private _getPathLogin(subpath: any): string {
    let path: string;
    path = `${this._Url}${subpath}`;
    return path;
  }
}

interface Options {
    headers?:
        | HttpHeaders
        | {
        [header: string]: string | string[];
    };
    params?:
        | HttpParams
        | {
        [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
    };
    
}
