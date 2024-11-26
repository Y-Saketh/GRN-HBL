import { NgModule } from '@angular/core';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { BsDropdownConfig} from 'ngx-bootstrap/dropdown';
import { SampleComponentComponent } from './default/sample-component/sample-component.component';

@NgModule({
  declarations: [
    SampleComponentComponent
  ],
  imports: [
    DashboardsRoutingModule,
  ],
  providers: [BsDropdownConfig],
})
export class DashboardsModule { }
