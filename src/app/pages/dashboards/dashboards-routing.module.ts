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
// import { Mb51Component } from 'src/app/GRNQRCodeGeneration/mb51/mb51.component';
import { Mb52Component } from 'src/app/GRNQRCodeGeneration/mb52/mb52.component';
import { GrnprintComponent } from 'src/app/GRNQRCodeGeneration/grnprint/grnprint.component';
import { Mb51Component } from 'src/app/GRNQRCodeGeneration/mb51/mb51.component';
import { GoodsReturnsComponent } from 'src/app/GRNQRCodeGeneration/goods-returns/goods-returns.component';
import { GRNagainstPOComponent } from 'src/app/GRNQRCodeGeneration/grnagainst-po/grnagainst-po.component';
import { PoPreviewComponent } from 'src/app/GRNQRCodeGeneration/po-preview/po-preview.component';

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
        component: QRcodegenrationComponent
    },
    {
        path: 'grnagainstpo',
        component: GRNagainstPOComponent
    },
    {
        path: 'QRcodegenration',
        component: GrnagainstidComponent
 
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
    {
        path: 'mb51',
        component: Mb51Component
    },
    {
        path: 'mb52',
        component: Mb52Component
    },
    {
        path: 'grnprint',
        component: GrnprintComponent
    },
    {
        path: 'goodsreturns',
        component: GoodsReturnsComponent
    },
    {
        path: 'popreview',
        component: PoPreviewComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardsRoutingModule {}
