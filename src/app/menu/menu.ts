import { CoreMenu } from '@core/types';

//? DOC: http://localhost:7777/demo/vuexy-angular-admin-dashboard-template/documentation/guide/development/navigation-menus.html#interface

export const menu: CoreMenu[] = [
  // Dashboard
  {
    id: 'dashboard/home',
    nombre: 'Principal',
    icono: 'home',
    // role: [1],
    type: 'item',
    url: 'home',
  },


  // {
  //   id: 'users',
  //   nombre: 'Usuarios',
  //   icono: 'users',
  //   // role: [2],
  //   type: 'item',
  //   url: 'users',
  // },

  // {
  //   id: 'pim',
  //   nombre: 'Lista Placas',
  //   icono: 'user',
  //   // role: [2],
  //   type: 'item',
  //   url: 'pim',
  // },


  // {
  //   id: 'phone',
  //   nombre: 'Telefonos',
  //   // role: [1],
  //   icono: 'phone-call',
  //   type: 'item',
  //   url: 'user/phone',
  // },

  // {
  //   id: 'religion',
  //   nombre: 'Religion',
  //   // role: [1],
  //   icono: 'user-plus',
  //   type: 'item',
  //   url: 'user/religion',
  // },

  // {
  //   id: 'blood-type',
  //   nombre: 'Grupo Sanguineo',
  //   // role: [1],
  //   icono: 'droplet',
  //   type: 'item',
  //   url: 'user/blood-type',
  // },

  // {
  //   id: 'allergies',
  //   nombre: 'Alergias',
  //   // role: [1],
  //   icono: 'alert-triangle',
  //   type: 'item',
  //   url: 'user/allergies',
  // },

  // {
  //   id: 'medical-history',
  //   nombre: 'Historial Medico',
  //   // role: [1],
  //   icono: 'plus-square',
  //   type: 'item',
  //   url: 'user/medical-history',
  // },


];
