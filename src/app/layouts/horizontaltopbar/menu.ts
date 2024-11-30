import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 1,
        label: 'MENUITEMS.DASHBOARDS.TEXT',
        icon: 'bx-home-circle',
        isCollapsed: false,
        subItems: [
            {
                id: 3,
                label: 'MENUITEMS.DASHBOARDS.LIST.OPENPOLIST',
                icon: 'bx-home-circle',
                link: 'openpolist',
                parentId: 2
            },
            {
                id: 4,
                label: 'MENUITEMS.DASHBOARDS.LIST.INBOUNDDELIVERY',
                link: 'inbounddelivery',
                parentId: 2
            },
            {
                id: 5,
                label: 'MENUITEMS.DASHBOARDS.LIST.GRNAGAINSTID',
                link: 'grnagainstid',
                parentId: 2
            },
            {
                id: 6,
                label: 'MENUITEMS.DASHBOARDS.LIST.QRCODEGENERATION',
                link: 'QRcodegenration',
                parentId: 2
            },

        ]
    },
    
];

