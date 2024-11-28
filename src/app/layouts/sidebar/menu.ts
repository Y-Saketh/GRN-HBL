import { MenuItem } from './menu.model';

export const MENU: MenuItem[] = [
    {
        id: 2,
        label: 'MENUITEMS.DASHBOARDS.TEXT',
        icon: 'bx-home-circle',
        subItems: [
            {
                id: 3,
                label: 'MENUITEMS.DASHBOARDS.LIST.OPENPOLIST',
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
            {
                id: 7,
                label: 'ZPRClose-Download',
                link: 'closeDownload',
                parentId: 2
            },
            {
                id: 8,
                label: 'ZGR PENDING',
                parentId: 2,
                subItems: [
                    {
                        id: 9,
                        label: 'IBD Done GR Pending',
                        link: 'grpending',
                        parentId: 8
                    },
                    {
                        id: 10,
                        label: 'IBD Done GR Done',
                        link: 'grdone',
                        parentId: 8
                    }
                ]
            },
        ]
    },
    // {
    //     id: 66,
    //     label: 'MENUITEMS.PAGES.TEXT',
    //     isTitle: true
    // },
    // {
    //     id: 67,
    //     label: 'MENUITEMS.AUTHENTICATION.TEXT',
    //     icon: 'bx-user-circle',
    //     subItems: [
    //         {
    //             id: 68,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.LOGIN',
    //             link: '/auth/login',
    //             parentId: 67
    //         },
    //         {
    //             id: 69,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.LOGIN2',
    //             link: '/auth/login-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 70,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.REGISTER',
    //             link: '/auth/signup',
    //             parentId: 67
    //         },
    //         {
    //             id: 71,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.REGISTER2',
    //             link: '/auth/signup-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 72,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD',
    //             link: '/auth/reset-password',
    //             parentId: 67
    //         },
    //         {
    //             id: 73,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.RECOVERPWD2',
    //             link: '/auth/recoverpwd-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 74,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN',
    //             link: '/pages/lock-screen-1',
    //             parentId: 67
    //         },
    //         {
    //             id: 75,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.LOCKSCREEN2',
    //             link: '/pages/lock-screen-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 76,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.CONFIRMMAIL',
    //             link: '/pages/confirm-mail',
    //             parentId: 67
    //         },
    //         {
    //             id: 77,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.CONFIRMMAIL2',
    //             link: '/pages/confirm-mail-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 78,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.EMAILVERIFICATION',
    //             link: '/pages/email-verification',
    //             parentId: 67
    //         },
    //         {
    //             id: 79,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.EMAILVERIFICATION2',
    //             link: '/pages/email-verification-2',
    //             parentId: 67
    //         },
    //         {
    //             id: 80,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.TWOSTEPVERIFICATION',
    //             link: '/pages/two-step-verification',
    //             parentId: 67
    //         },
    //         {
    //             id: 81,
    //             label: 'MENUITEMS.AUTHENTICATION.LIST.TWOSTEPVERIFICATION2',
    //             link: '/pages/two-step-verification-2',
    //             parentId: 67
    //         }
    //     ]
    // },
    // {
    //     id: 82,
    //     label: 'MENUITEMS.UTILITY.TEXT',
    //     icon: 'bx-file',
    //     subItems: [
    //         {
    //             id: 83,
    //             label: 'MENUITEMS.UTILITY.LIST.STARTER',
    //             link: '/pages/starter',
    //             parentId: 82
    //         },
    //         {
    //             id: 84,
    //             label: 'MENUITEMS.UTILITY.LIST.MAINTENANCE',
    //             link: '/pages/maintenance',
    //             parentId: 82
    //         },
    //         {
    //             id: 85,
    //             label: 'Coming Soon',
    //             link: '/pages/coming-soon',
    //             parentId: 82
    //         },
    //         {
    //             id: 86,
    //             label: 'MENUITEMS.UTILITY.LIST.TIMELINE',
    //             link: '/pages/timeline',
    //             parentId: 82
    //         },
    //         {
    //             id: 87,
    //             label: 'MENUITEMS.UTILITY.LIST.FAQS',
    //             link: '/pages/faqs',
    //             parentId: 82
    //         },
    //         {
    //             id: 88,
    //             label: 'MENUITEMS.UTILITY.LIST.PRICING',
    //             link: '/pages/pricing',
    //             parentId: 82
    //         },
    //         {
    //             id: 89,
    //             label: 'MENUITEMS.UTILITY.LIST.ERROR404',
    //             link: '/pages/404',
    //             parentId: 82
    //         },
    //         {
    //             id: 90,
    //             label: 'MENUITEMS.UTILITY.LIST.ERROR500',
    //             link: '/pages/500',
    //             parentId: 82
    //         },
    //     ]
    // },
    // {
    //     id: 143,
    //     label: 'MENUITEMS.MULTILEVEL.TEXT',
    //     icon: 'bx-share-alt',
    //     subItems: [
    //         {
    //             id: 144,
    //             label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.1',
    //             parentId: 143
    //         },
    //         {
    //             id: 145,
    //             label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.2',
    //             parentId: 143,
    //             subItems: [
    //                 {
    //                     id: 146,
    //                     label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.LEVEL2.1',
    //                     parentId: 145,
    //                 },
    //                 {
    //                     id: 147,
    //                     label: 'MENUITEMS.MULTILEVEL.LIST.LEVEL1.LEVEL2.2',
    //                     parentId: 145,
    //                 }
    //             ]
    //         },
    //     ]
    // }
];

