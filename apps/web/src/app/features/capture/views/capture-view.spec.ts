import { provideHttpClient } from '@angular/common/http'
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import type { FileValidation } from '../model/capture'
import { CaptureView } from './capture-view'

const QUARANTINED: FileValidation = {
  sourceFileId: 'sf-0001',
  fileName: 'recepcion-sab-24oct.xlsx',
  sha256: 'a'.repeat(64),
  family: 'recepcion_rollo',
  familySource: 'detected',
  decision: 'quarantine',
  rules: [
    { code: 'R-P1', passed: false, message: 'R-017 llegó sin certificado.' },
  ],
  summary: 'R-017 queda detenido.',
  searchKey: 'R-017',
}

describe('CaptureView (Captura: subir, familia, huella y validación)', () => {
  let fixture: ComponentFixture<CaptureView>
  let el: HTMLElement
  let http: HttpTestingController

  const file = (name: string) =>
    new File(['contenido'], name, { type: 'application/octet-stream' })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptureView],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents()
    http = TestBed.inject(HttpTestingController)
    fixture = TestBed.createComponent(CaptureView)
    el = fixture.nativeElement as HTMLElement
    await fixture.whenStable()
  })

  afterEach(() => http.verify())

  it('invites to upload before anything is sent', () => {
    expect(el.querySelector('h1')?.textContent).toContain('Captura')
    expect(el.querySelector('[data-test="dropzone"]')).toBeTruthy()
    expect(el.querySelector('[data-test="no-uploads"]')).toBeTruthy()
  })

  it('rejects a type the plant does not use without calling the API', async () => {
    fixture.componentInstance.addFiles([file('programa.exe')])
    await fixture.whenStable()
    expect(
      el.querySelector('[data-test="upload-error"]')?.textContent,
    ).toContain('no se acepta')
  })

  it('uploads, then shows family, fingerprint and the rule that stopped it (G2)', async () => {
    fixture.componentInstance.addFiles([file('recepcion-sab-24oct.xlsx')])
    const upload = http.expectOne('/v1/files')
    expect(upload.request.method).toBe('POST')
    expect(upload.request.body).toBeInstanceOf(FormData)
    upload.flush({ sourceFileId: 'sf-0001', sha256: 'a'.repeat(64) })

    http.expectOne('/v1/files/sf-0001/validation').flush(QUARANTINED)
    await fixture.whenStable()

    const result = el.querySelector('[data-test="validation"]')
    expect(result?.getAttribute('data-decision')).toBe('quarantine')
    expect(
      result?.querySelector('[data-family="recepcion_rollo"]'),
    ).toBeTruthy()
    expect(result?.querySelector('[data-rule="R-P1"]')).toBeTruthy()
    expect(el.textContent).toContain('El original quedó guardado tal cual')
    expect(
      result?.querySelector('[data-test="to-inbox"]')?.getAttribute('href'),
    ).toBe('/inbox')
  })

  it('sends the declared family and links a clean file to Búsqueda', async () => {
    fixture.componentInstance.onFamilyChange('inventario')
    fixture.componentInstance.addFiles([file('conteo.xlsx')])
    const upload = http.expectOne('/v1/files')
    expect((upload.request.body as FormData).get('family')).toBe('inventario')
    upload.flush({ sourceFileId: 'sf-0002', sha256: 'b'.repeat(64) })
    http.expectOne('/v1/files/sf-0002/validation').flush({
      ...QUARANTINED,
      sourceFileId: 'sf-0002',
      family: 'inventario',
      familySource: 'declared',
      decision: 'valid',
      rules: [],
      searchKey: 'MAT-TYV-01',
    })
    await fixture.whenStable()
    expect(
      el.querySelector('[data-test="to-search"]')?.getAttribute('href'),
    ).toBe('/search?q=MAT-TYV-01')
  })

  it('shows the server message when the upload fails (duplicate)', async () => {
    fixture.componentInstance.addFiles([file('turno.xlsx')])
    http
      .expectOne('/v1/files')
      .flush(
        { code: 'CONFLICT', message: 'Este archivo ya se subió.' },
        { status: 409, statusText: 'Conflict' },
      )
    await fixture.whenStable()
    expect(
      el.querySelector('[data-test="upload-error"]')?.textContent,
    ).toContain('ya se subió')
  })
})
