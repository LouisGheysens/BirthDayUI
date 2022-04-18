import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PersonListComponent } from './components/person/person-list/person-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'personen', pathMatch: 'full' },
  { path: 'personen', component: PersonListComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
