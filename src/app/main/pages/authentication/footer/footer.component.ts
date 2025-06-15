import { Component, OnInit } from '@angular/core';
import { VERSION } from '@angular/core';
import { UtilService } from '@core/services/util/util.service';
import { environment } from 'environments/environment'
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { UpdateService } from 'app/auth/service';



@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public currentDate: Date;
  public build
  public fechaX
  public fechafinal

  public ShowbuildDateTimeGitHub: boolean = true;

  constructor(
    private utilservice: UtilService,
    private http: HttpClient,
    private updateService: UpdateService
  ) { }
  public Version

  async ngOnInit() {
    sessionStorage.removeItem('version')
    sessionStorage.setItem('version', environment.buildDateTime)
    // await this.getBuildDateTime();
    this.currentDate = new Date();
    this.fechafinal = environment.buildDateTime
    this.fechaX = 'Build: ' + this.utilservice.FechaMoment(environment.buildDateTime)
    this.build = this.utilservice.FechaMomentL(environment.buildDateTime).replace(/\//g, '.')
    this.Version = VERSION.full

  }

  async getBuildDateTime() {
    const url = 'https://github.com/elpoloxrodriguez/caejerb/blob/main/src/environments/environment.prod.ts';

    await this.http.get(url, { responseType: 'text' }).subscribe(
      (data: string) => {
        // Extraer el valor de buildDateTime usando una expresión regular
        const match = data.match(/buildDateTime:\s*'([^']+)'/);
        const hash = sessionStorage.getItem('version');

        if (match && match[1]) {
          const buildDateTimeGitHub = match[1];
          // Comparar match[1] con el hash
          if (buildDateTimeGitHub === hash) {
            this.updateService.notifyUpdateAvailable(false);
            // console.log('Los valores coinciden:', buildDateTimeGitHub);
            // Aquí puedes agregar la lógica si los valores coinciden
          } else {
            // console.log('Los valores NO coinciden:', buildDateTimeGitHub);
            // Aquí puedes agregar la lógica si los valores NO coinciden
            this.updateService.notifyUpdateAvailable(true);
            Swal.fire({
              title: '<strong><font color="red">Actualización Disponible</font></strong>',
              html: `
    <div style="text-align: left; font-family: Arial, sans-serif;">
      <div style="text-align: center; color: #2c3e50; margin-bottom: 20px;">
        <strong style="font-size: 1.2em;"><font color="red">¡ATENCIÓN USUARIO!</font></strong>
      </div>
      
      <p style="margin-bottom: 15px;">Se ha detectado una nueva versión del sistema disponible. Para garantizar el correcto funcionamiento y acceso a la plataforma, por favor:</p>
      
      <ul style="margin-left: 20px; margin-bottom: 20px;">
        <li style="margin-bottom: 8px;">🗑 <strong>Elimine el historial de navegación</strong></li>
        <li style="margin-bottom: 8px;">🍪 <strong>Borre todas las cookies y datos del sitio</strong></li>
        <li style="margin-bottom: 8px;">🔄 <strong>Asegúrese de usar la versión más reciente de su navegador</strong></li>
      </ul>
      
      <div style="background-color: #f8f9fa; padding: 12px; border-left: 4px solid #dc3545; margin: 15px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
        <span style="background-color: #dc3545; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px;">!</span>
        <strong style="color: #dc3545;">Notificación Crítica:</strong>
    </div>
    <p style="margin: 0; color: #212529; line-height: 1.5;">
        De no realizar los pasos recomendados, <strong>el sistema impedirá el inicio de sesión</strong> como medida de seguridad, 
        ya que la versión desactualizada puede generar <strong>errores críticos en los registros enviados</strong>, 
        comprometiendo la integridad de los datos.
    </p>
</div>
      
      <p style="font-style: italic; color: #555;">Esta actualización incluye mejoras de seguridad y funcionalidades que optimizarán su experiencia de usuario.</p>
    </div>
              `,
              icon: 'warning',
              confirmButtonText: 'Gracias!!!'
            });
          }
        } else {
          this.updateService.notifyUpdateAvailable(true);
          console.error('No se encontró buildDateTime en el archivo.');
          Swal.fire({
            title: 'Oops Lo Sentimos!',
            html: '<strong>No se encontró Versión</strong><br> le sugerimos eliminar el historial de su navegador y eliminar las cookies, para poder disfrutar de las nuevas actualizaciones!',
            icon: 'error',
          })
        }
      },
      (error) => {
        console.error('Error al obtener el archivo:', error);
        this.updateService.notifyUpdateAvailable(true);
        Swal.fire({
          title: 'Oops Lo Sentimos!!!',
          text: 'La conexión no es estable, por favor intente nuevamente.',
          html: '<strong>Le sugerimos eliminar el historial de su navegador y eliminar las cookies, para poder disfrutar de las nuevas actualizaciones!</strong>',
          icon: 'warning',
        })
      }
    );
  }

}
