import { Routes } from '@angular/router';
import { ProjectsListComponent } from './components/projects-list/projects-list.component';

export const projectsRoutes: Routes = [
  {
    path: '',
    component: ProjectsListComponent
  }
];
