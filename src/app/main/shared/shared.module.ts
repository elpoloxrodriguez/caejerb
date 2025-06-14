import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { PhoneComponent } from './phone/phone.component';
import { ReligionComponent } from './religion/religion.component';
import { BloodTypeComponent } from './blood-type/blood-type.component';
import { AllergiesComponent } from './allergies/allergies.component';
import { MedicalHistoryComponent } from './medical-history/medical-history.component';
import { AngularFileUploaderModule } from 'angular-file-uploader';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BlockUIModule } from 'ng-block-ui';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { CoreCommonModule } from '@core/common.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PhoneComponent,
    ReligionComponent,
    BloodTypeComponent,
    AllergiesComponent,
    MedicalHistoryComponent
  ],
  imports: [
    CommonModule,
    AngularFileUploaderModule,
    NgxDatatableModule,
    BlockUIModule,
    SharedRoutingModule,
    ContentHeaderModule,
    CoreCommonModule,
    NgbModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class SharedModule { }
