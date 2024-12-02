import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    //main row items 
    {
        id: "menu",
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
        id: "openpolist",//3,
        label: 'MENUITEMS.DASHBOARDS.LIST.OPENPOLIST',
        link: 'openpolist',
        icon: 'bx-archive',
        parentId: "menu"
    },
    {
        id: "zgribdstatus",
        label: 'ZGR & IBD Status',
        icon: 'bx-cloud-download',
        parentId: "menu",
        subItems: [
            {
                id: "grpending",
                label: 'GR Pending',
                link: 'grpending',
                icon: 'bx-badge',
                parentId: "zgribdstatus"
            },
            {
                id: "grdone",
                label: 'GR Done',
                link: 'grdone',
                icon: 'bx-badge-check',
                parentId: "zgribdstatus"
            }
        ]
    },
    {
        id: "QRcodegenration",
        label: 'MENUITEMS.DASHBOARDS.LIST.QRCODEGENERATION',
        link: 'QRcodegenration',
        icon: 'bx-bar-chart',
        parentId: "menu"
    },
    {
        id: "inbounddelivery",
        label: 'MENUITEMS.DASHBOARDS.LIST.INBOUNDDELIVERY',
        link: 'inbounddelivery',
        icon: 'bx-archive-in',
        parentId: "menu"
    },
    {
        id: "grnagainstid",
        label: 'MENUITEMS.DASHBOARDS.LIST.GRNAGAINSTID',
        link: 'grnagainstid',
        icon: 'bx-aperture',
        parentId: "menu"
    },
    
    {
        id: "closeDownload",
        label: 'ZPRClose-Download',
        link: 'closeDownload',
        icon: 'bx-cloud-download',
        parentId: "menu"
    },
   
    
];

