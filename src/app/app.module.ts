import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import 'hammerjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from '@core/core.module';
import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule, CoreThemeCustomizerModule } from '@core/components';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';


import { coreConfig } from 'app/app-config';
import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { DashboardModule } from 'app/main/dashboard/dashboard.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

// Subir Archivos
import { AngularFileUploaderModule } from "angular-file-uploader";
import { HashLocationStrategy, JsonPipe, LocationStrategy } from '@angular/common';

import { AuthGuardGuard } from '@core/services/seguridad/auth-guard.guard';

import { AuthInterceptorService } from '@core/services/seguridad/auth-interceptor.service';
import { ErrorInterceptor } from './auth/helpers';
import { BlockUIModule } from 'ng-block-ui';
import { ChartsModule } from 'ng2-charts';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

// Recaptcha V3

import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { SharedModule } from "./main/license-bunker/shared.module";


registerLocaleData(localeEs);


const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./main/pages/pages.module').then(m => m.PagesModule),
  },
  {
    path: '**',
    redirectTo: '/miscellaneous/error' //Error 404 - Page not found
  }
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NgxDatatableModule,
    ChartsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, {
        scrollPositionRestoration: 'enabled', // Add options right here
        relativeLinkResolution: 'legacy',
        useHash: true
    }),
    TranslateModule.forRoot(),
    BlockUIModule.forRoot(),
    // NgBootstrap,
    NgbModule,
    // Core modules
    CoreModule.forRoot(coreConfig),
    CoreCommonModule,
    CoreSidebarModule,
    AngularFileUploaderModule,
    CoreThemeCustomizerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    //  Recaptcha V3
    RecaptchaV3Module,
    SharedModule,
    
    // App modules
    LayoutModule,
    DashboardModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
        enabled: environment.production,
        // Register the ServiceWorker as soon as the application is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: 'registerWhenStable:30000'
    }),
    SharedModule
],
  providers: [
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: [LocationStrategy, AuthGuardGuard, JsonPipe], useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    //  Recaptcha V3
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptcha.siteKey },
    // Fin de Recaptcha
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
