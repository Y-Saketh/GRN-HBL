import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    //main row items 
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARDS.TEXT',
        icon: 'bx-home-circle',

        //for sub items use this array 
        subItems: [
            // {
            //     id: 3,
            //     label: 'MENUITEMS.DASHBOARDS.LIST.OPENPOLIST',
            //     link: 'openpolist',
            //     icon: 'bx-archive',
            //     parentId: 2
            // },
           
            // {
                
            //     id: 4,
            //     label: 'MENUITEMS.DASHBOARDS.LIST.INBOUNDDELIVERY',
            //     link: 'inbounddelivery',
            //     icon: 'bx-archive-in',
            //     parentId: 2
            // },
            // {
            //     id: 5,
            //     label: 'MENUITEMS.DASHBOARDS.LIST.GRNAGAINSTID',
            //     link: 'grnagainstid',
            //     icon: 'bx-aperture',
            //     parentId: 2
            // },
            // {
            //     id: 6,
            //     label: 'MENUITEMS.DASHBOARDS.LIST.QRCODEGENERATION',
            //     link: 'QRcodegenration',
            //     icon: 'bx-bar-chart',
            //     parentId: 2
            // },
            // {
            //     id: 7,
            //     label: 'ZPRClose-Download',
            //     link: 'closeDownload',
            //     icon: 'bx-cloud-download',
            //     parentId: 2
            // },
            // {
            //     id: 8,
            //     label: 'ZGR & IBD Status',
            //     icon: 'bx-cloud-download',
            //     parentId: 2,
            //     subItems: [
            //         {
            //             id: 9,
            //             label: 'GR Pending',
            //             link: 'grpending',
            //             icon: 'bx-badge',
            //             parentId: 8
            //         },
            //         {
            //             id: 10,
            //             label: 'GR Done',
            //             link: 'grdone',
            //             icon: 'bx-badge-check',
            //             parentId: 8
            //         }
            //     ]
            // },
        ]
    },
    {
        id: 3,
        label: 'MENUITEMS.DASHBOARDS.LIST.OPENPOLIST',
        link: 'openpolist',
        icon: 'bx-archive',
        parentId: 2
    },
    {
        id: 4,
        label: 'ZGR & IBD Status',
        icon: 'bx-cloud-download',
        parentId: 2,
        subItems: [
            {
                id: 5,
                label: 'GR Pending',
                link: 'grpending',
                icon: 'bx-badge',
                parentId: 4
            },
            {
                id: 6,
                label: 'GR Done',
                link: 'grdone',
                icon: 'bx-badge-check',
                parentId: 4
            }
        ]
    },
    {
        id: 7,
        label: 'MENUITEMS.DASHBOARDS.LIST.QRCODEGENERATION',
        link: 'QRcodegenration',
        icon: 'bx-bar-chart',
        parentId: 2
    },
    {
        id: 8,
        label: 'MENUITEMS.DASHBOARDS.LIST.INBOUNDDELIVERY',
        link: 'inbounddelivery',
        icon: 'bx-archive-in',
        parentId: 2
    },
    {
        id: 9,
        label: 'MENUITEMS.DASHBOARDS.LIST.GRNAGAINSTID',
        link: 'grnagainstid',
        icon: 'bx-aperture',
        parentId: 2
    },
    
    {
        id: 10,
        label: 'ZPRClose-Download',
        link: 'closeDownload',
        icon: 'bx-cloud-download',
        parentId: 2
    },
   
    
];

