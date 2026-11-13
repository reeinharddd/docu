import { Component, computed, Directive, input } from '@angular/core'

/**
 * Atomic button (design system §9.1). One component, one place for the
 * styles: a screen picks a variant and never writes its own button CSS.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md border font-body font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-action text-on-brand border-transparent hover:bg-action-hover',
  secondary:
    'bg-surface text-brand-text border-2 border-brand-text hover:bg-brand-soft',
  ghost:
    'bg-transparent text-brand-text border-transparent hover:bg-brand-soft',
  danger: 'bg-quarantine text-on-brand border-quarantine hover:opacity-90',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'min-h-11 px-4 text-base',
  lg: 'min-h-13 px-5 text-lg',
}

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
})
export class Button {
  readonly variant = input<ButtonVariant>('primary')
  readonly size = input<ButtonSize>('md')
  readonly type = input<'button' | 'submit'>('button')
  readonly disabled = input(false)
  readonly loading = input(false)
  /** Accessible name for icon-only buttons (the label goes on the native button). */
  readonly ariaLabel = input<string | null>(null)

  readonly classes = computed(
    () => `${BASE} ${SIZES[this.size()]} ${VARIANTS[this.variant()]}`,
  )
}

/**
 * The same button look on a link (`<a appButtonLink routerLink="...">`).
 * Navigation is a link, not a button: it keeps href, open-in-new-tab and
 * the right role for screen readers, with the styles still in one place.
 */
@Directive({
  selector: 'a[appButtonLink]',
  host: {
    '[class]': 'classes()',
    '[attr.data-variant]': 'variant()',
  },
})
export class ButtonLink {
  readonly variant = input<ButtonVariant>('secondary')
  readonly size = input<ButtonSize>('md')

  readonly classes = computed(
    () =>
      `${BASE} no-underline ${SIZES[this.size()]} ${VARIANTS[this.variant()]}`,
  )
}
