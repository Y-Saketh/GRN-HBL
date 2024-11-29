import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './default/default.component';

import { SampleComponentComponent } from './default/sample-component/sample-component.component';
import { OpenpolistComponent } from 'src/app/GRNQRCodeGeneration/openpolist/openpolist.component';
import { InbounddeliveryComponent } from 'src/app/GRNQRCodeGeneration/inbounddelivery/inbounddelivery.component';
import { GrnagainstidComponent } from 'src/app/GRNQRCodeGeneration/grnagainstid/grnagainstid.component';
import { QRcodegenrationComponent } from 'src/app/GRNQRCodeGeneration/qrcodegenration/qrcodegenration.component';
import { GrpendingComponent } from 'src/app/GRNQRCodeGeneration/grpending/grpending.component';
import { GrdoneComponent } from 'src/app/GRNQRCodeGeneration/grdone/grdone.component';
import { CloseDownloadComponent } from 'src/app/GRNQRCodeGeneration/close-download/close-download.component';

const routes: Routes = [
    {
        path: 'default',
        component: DefaultComponent
    },
    {
        path: 'sampleComponent',
        component: SampleComponentComponent
    },
    {
        path: 'openpolist',
        component: OpenpolistComponent
    },
    {
        path: 'inbounddelivery',
        component: InbounddeliveryComponent
    },
    {
        path: 'grnagainstid',
        component: GrnagainstidComponent
    },
    {
        path: 'QRcodegenration',
        component: QRcodegenrationComponent
    },
    {
        path: 'grpending',
        component: GrpendingComponent
    },
    {
        path: 'grdone',
        component: GrdoneComponent
    },
    {
        path: 'closeDownload',
        component: CloseDownloadComponent
    },
   
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardsRoutingModule {}
