export interface MenuItem {
    id?: string;
    label?: string;
    icon?: string;
    link?: string;
    subItems?: MenuItem[];
    isTitle?: boolean;
    badge?: {
      variant: string;
      text: string;
    };
    parentId?: string;
    isLayout?: boolean;
}
  