import { Routes } from '@angular/router';
import { TasksListComponent } from './components/tasks-list/tasks-list.component';

export const tasksRoutes: Routes = [
  {
    path: '',
    component: TasksListComponent
  }
];
