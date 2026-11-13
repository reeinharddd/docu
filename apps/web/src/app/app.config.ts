import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http'
import {
  type ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core'
import { provideRouter } from '@angular/router'
import { routes } from './app.routes'
import {
  demoBackendInterceptor,
  provideDemoBackend,
} from './core/middleware/api/demo-backend'
import { apiInterceptors } from './core/middleware/api/interceptors'
import { captureDemoRoutes } from './features/capture/fixtures/capture.fixture'
import { inboxDemoRoutes } from './features/inbox/fixtures/inbox.fixture'
import { reportsDemoRoutes } from './features/reports/fixtures/reports.fixture'
import { scheduleDemoRoutes } from './features/schedule/fixtures/schedule.fixture'
import { searchDemoRoutes } from './features/search/fixtures/search.fixture'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withFetch(),
      // DEMO ONLY: demoBackendInterceptor serves the local fixtures until
      // the API (#12) and the corpus (#61) land. Remove it and its
      // provideDemoBackend below; screens and specs do not change.
      withInterceptors([...apiInterceptors, demoBackendInterceptor]),
    ),
    provideRouter(routes),
    provideDemoBackend(() => [
      ...captureDemoRoutes(),
      ...inboxDemoRoutes(),
      ...scheduleDemoRoutes(),
      ...searchDemoRoutes(),
      ...reportsDemoRoutes(),
    ]),
  ],
}
