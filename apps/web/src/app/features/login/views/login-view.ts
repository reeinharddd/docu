import { Component, inject } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../../../core/services/auth/auth.service'
import { Button } from '../../../ui/atoms/button/button'
import { PageHeader } from '../../../ui/molecules/page-header/page-header'

/**
 * Placeholder login. DEMO ONLY: the demo button starts a full-permission
 * session. When POST /v1/auth/login lands (#12), this page calls the real
 * API and everything dynamic comes from the backend.
 */
@Component({
  imports: [Button, PageHeader],
  selector: 'app-login',
  templateUrl: './login-view.html',
})
export class LoginView {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  entrarDemo(): void {
    this.auth.signInDemo()
    void this.router.navigate(['/capture'])
  }
}
