import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './default/default.component';
import { SaasComponent } from './saas/saas.component';
import { CryptoComponent } from './crypto/crypto.component';
import { BlogComponent } from './blog/blog.component';
import { JobsComponent } from "./jobs/jobs.component";
import { SampleComponentComponent } from './default/sample-component/sample-component.component';
import { OpenpolistComponent } from 'src/app/GRNQRCodeGeneration/openpolist/openpolist.component';
import { InbounddeliveryComponent } from 'src/app/GRNQRCodeGeneration/inbounddelivery/inbounddelivery.component';
import { GrnagainstidComponent } from 'src/app/GRNQRCodeGeneration/grnagainstid/grnagainstid.component';
import { QRcodegenrationComponent } from 'src/app/GRNQRCodeGeneration/qrcodegenration/qrcodegenration.component';

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
    // {
    //     path: 'saas',
    //     component: SaasComponent
    // },
    // {
    //     path: 'crypto',
    //     component: CryptoComponent
    // },
    // {
    //     path: 'blog',
    //     component: BlogComponent
    // },
    // {
    //     path:"jobs",
    //     component:JobsComponent
    // }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardsRoutingModule {}
