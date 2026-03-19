import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'projects',
    loadChildren: () =>
      import('./features/projects/projects.routes').then(
        (m) => m.projectsRoutes
      )
  },
  {
    path: 'projects/:userId/tasks',
    loadChildren: () =>
      import('./features/tasks/tasks.routes').then(
        (m) => m.tasksRoutes
      )
  },
  {
    path: '',
    redirectTo: '/projects',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/projects'
  }
];
