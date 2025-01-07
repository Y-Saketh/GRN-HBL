import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    //main row items 
    {
        // id: "menu",
        // label: 'Goods Movement',
        // icon: 'bx-home-circle',
        id: "GRN",
        label: 'Goods Movement',
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
        id: "grnagainstpo",
        label: 'MENUITEMS.DASHBOARDS.LIST.GRNAGAINSTPO',
        link: 'grnagainstpo',
        icon: 'bx-package',
        parentId: "menu"
    },
    {
        id: "goodreturns",
        label: 'MENUITEMS.DASHBOARDS.LIST.GOODSRETURN',
        link: 'goodsreturns',
        icon: 'bx-analyse',
        parentId: "menu"
    },
    {
        id: "QRcodegenration",
        label: 'MENUITEMS.DASHBOARDS.LIST.QRCODEGENERATION',
        link: 'QRcodegenration',
        icon: 'bx-label',
        parentId: "menu"
    },
    {
        id: "grnprint",
        label: 'MENUITEMS.DASHBOARDS.LIST.GRNPRINT',
        link: 'grnprint',
        icon: 'bx-paperclip',
        parentId: "menu"
    },
    {
        id: "grnprint",
        label: 'MENUITEMS.DASHBOARDS.LIST.ZVEN',
        link:'zven',
        icon: 'bx-detail',
        parentId: "menu"
    },
  
    {
        id: "zgribdstatus",
        label: 'Reports',
        icon: 'bx-cloud-download',
        parentId: "menu",
        subItems: [
            {
                id: "grpending",
                label: 'MENUITEMS.DASHBOARDS.LIST.GRPENDING',
                link: 'grpending',
                icon: 'bx-badge',
                parentId: "zgribdstatus"
            },
            {
                id: "grdone",
                label: 'MENUITEMS.DASHBOARDS.LIST.GRDONE',
                link: 'grdone',
                icon: 'bx-badge-check',
                parentId: "zgribdstatus"
            },
            {
                id: "closeDownload",
                label: 'MENUITEMS.DASHBOARDS.LIST.OPENPRLIST',
                link: 'closeDownload',
                icon: 'bx-cloud-download',
                parentId: "menu"
            },
            {
                id: "openpolist",
                label: 'MENUITEMS.DASHBOARDS.LIST.OPENPOLIST',
                link: 'openpolist',
                icon: 'bx-archive',
                parentId: "menu"
            },
        
            {
                id: "mb51",
                label: 'MENUITEMS.DASHBOARDS.LIST.MB51',
                link: 'mb51',
                icon: 'bx-layer',
                parentId: "menu"
            },
            {
                id: "mb52",
                label: 'MENUITEMS.DASHBOARDS.LIST.MB52',
                link: 'mb52',
                icon: 'bx-layer',
                parentId: "menu"
            },
            {
                id: "popreview",
                label: 'MENUITEMS.DASHBOARDS.LIST.PREVIEW',
                link: 'popreview',
                icon: 'bx-screenshot',
                parentId: "menu"
            },
            {
                id: "popreview",
                label: 'MENUITEMS.DASHBOARDS.LIST.SCREEN2',
                link:'screen2',
                icon: 'bx-screenshot',
                parentId: "menu"
            }
            // {
            //     id: "vendorreturnDC",
            //     label: 'MENUITEMS.DASHBOARDS.LIST.ZVEN',
            //     link:'zven',
            //     icon: 'bx-layer',
            //     parentId: "menu"
            // },
            // {
            //     id: "debitnote",
            //     label: 'MENUITEMS.DASHBOARDS.LIST.SCREEN2',
            //     link:'screen2',
            //     icon: 'bx-cloud-download',
            //     parentId: "menu"
            // }
        
        ]
    },

    
    {
        id: "zgribdstatus",
        label: 'QM',
        icon: 'bx-home-circle',
        parentId: "menu",
        subItems: [
            {
                id: "mb51",
                label: 'MENUITEMS.DASHBOARD.LIST.RESULTRECORDING',
                link: 'resultlRecording',
                icon: 'bx-badge',
                parentId: "zgribdstatus"
            },
            {
                id: "mb51",
                label: 'MENUITEMS.DASHBOARD.LIST.USAGEDECISION',
                link: 'usageDecision',
                icon: 'bx-badge',
                parentId: "zgribdstatus"
            },


        ]
    },
   
    
];

