import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { HomeComponent } from './views/home/home.component';
import { ProfileComponent } from './views/profile/profile.component';
import { BlankComponent } from './layout/blank/blank.component';
import { LoginComponent } from './views/auth/login/login.component';
import { RegisterComponent } from './views/auth/register/register.component';
import { IndexComponent } from './layout/index/index.component';
import { ProductListComponent } from './views/product-list/product-list.component';
import { ProductDetailsComponent } from './views/product-details/product-details.component';
import { AboutComponent } from './views/about/about.component';
import { CartPageComponent } from './views/cart-page/cart-page.component';
import { AdminComponent } from './layout/admin/admin.component';
import { DashboardComponent } from './views/admin/dashboard/dashboard.component';
import { ProductsComponent } from './views/admin/products/products.component';
import { CategoriesComponent } from './views/admin/categories/categories.component';
import { ProcessControlComponent } from './views/process-control/process-control.component';
import { ContactComponent } from './views/contact/contact.component';
import { OrderComponent } from './views/order/order.component';
import { OrdersComponent } from './views/admin/orders/orders.component';

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
      { path: 'home', component: HomeComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'profile/:section', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'products', component: ProductListComponent },
      { path: 'products/:id', component: ProductDetailsComponent },
      { path: 'about', component: AboutComponent },
      { path: 'contact', component: ContactComponent },
      { path: 'cart', component: CartPageComponent, canActivate: [AuthGuard] },
      { path: 'orders', component: OrderComponent, canActivate: [AuthGuard] },
      { path: 'process', component: ProcessControlComponent, canActivate: [AuthGuard]}
    ]
  },
  {
    path: 'auth',
    component: BlankComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'orders', component: OrdersComponent },
    ]
  },
  { path: '**', redirectTo: 'home', pathMatch: 'full' }
];

