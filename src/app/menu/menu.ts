import { CoreMenu } from '@core/types';

//? DOC: http://localhost:7777/demo/vuexy-angular-admin-dashboard-template/documentation/guide/development/navigation-menus.html#interface

export const menu: CoreMenu[] = [
  // Dashboard
  {
    id: 'dashboard/home',
    nombre: 'Principal',
    icono: 'home',
    role: [1],
    type: 'item',
    url: 'home',
  },

  // AUDITORIA
  {
    id: 'audit',
    nombre: 'Auditoria',
    role: [3, 4],
    icono: 'database',
    type: 'item',
    url: 'audit/audit',
  },


];
