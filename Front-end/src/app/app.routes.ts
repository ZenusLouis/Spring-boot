import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { IndexComponent } from './layout/index/index.component';
import { BlankComponent } from './layout/blank/blank.component';
import { AdminComponent } from './layout/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '',
    component: IndexComponent,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./views/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./views/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'profile/:section',
        loadComponent: () => import('./views/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'products',
        loadComponent: () => import('./views/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./views/product-details/product-details.component').then(m => m.ProductDetailsComponent)
      },
      {
        path: 'about',
        loadComponent: () => import('./views/about/about.component').then(m => m.AboutComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./views/contact/contact.component').then(m => m.ContactComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./views/cart-page/cart-page.component').then(m => m.CartPageComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'orders',
        loadComponent: () => import('./views/order/order.component').then(m => m.OrderComponent),
        canActivate: [AuthGuard]
      },
      {
        path: 'process',
        loadComponent: () =>
          import('./views/process-control/process-control.component').then(m => m.ProcessControlComponent),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: 'auth',
    component: BlankComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./views/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./views/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        loadComponent: () => import('./views/admin/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./views/admin/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./views/admin/categories/categories.component').then(m => m.CategoriesComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./views/admin/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./views/admin/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'contacts',
        loadComponent: () => import('./views/admin/contacts/contacts.component').then(m => m.ContactsComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];
