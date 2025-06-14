import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { NgSelectModule } from '@ng-select/ng-select'
import { CoreCommonModule } from '@core/common.module'
import { TranslateModule } from '@ngx-translate/core'
import { PhoneComponent } from './phone/phone.component';
import { AuthGuard } from 'app/auth/helpers/auth.guards';
import { AuthGuardGuard } from '@core/services/seguridad/auth-guard.guard';
import { ReligionComponent } from './religion/religion.component'
import { BloodTypeComponent } from './blood-type/blood-type.component'
import { AllergiesComponent } from './allergies/allergies.component'
import { MedicalHistoryComponent } from './medical-history/medical-history.component'


const routes: Routes = [
  {
    path: 'user/phone',
    component: PhoneComponent,
    canActivate: [AuthGuard, AuthGuardGuard],
    data: { roles: [1] },
  },
  {
    path: 'user/religion',
    component: ReligionComponent,
    canActivate: [AuthGuard, AuthGuardGuard],
    data: { roles: [1] },
  },
  {
    path: 'user/blood-type',
    component: BloodTypeComponent,
    canActivate: [AuthGuard, AuthGuardGuard],
    data: { roles: [1] },
  },
  {
    path: 'user/allergies',
    component: AllergiesComponent,
    canActivate: [AuthGuard, AuthGuardGuard],
    data: { roles: [1] },
  },
    {
    path: 'user/medical-history',
    component: MedicalHistoryComponent,
    canActivate: [AuthGuard, AuthGuardGuard],
    data: { roles: [1] },
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreCommonModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

  ],
  exports: [RouterModule]
})
export class SharedRoutingModule { }
