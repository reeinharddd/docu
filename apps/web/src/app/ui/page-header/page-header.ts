import { Component, input } from '@angular/core'

/** Shared page header: one title style for every screen. */
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  readonly title = input.required<string>()
  readonly lead = input<string>('')
}
