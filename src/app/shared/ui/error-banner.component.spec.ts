import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';

import { ErrorBannerComponent } from './error-banner.component';

describe('ErrorBannerComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [ErrorBannerComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ErrorBannerComponent);
    fixture.componentRef.setInput('message', 'Something went wrong');
    fixture.detectChanges();
    return { fixture };
  }

  it('should render the message', async () => {
    const { fixture } = await setup();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Something went wrong');
  });

  it('should render hlm-alert', async () => {
    const { fixture } = await setup();

    const alert = fixture.debugElement.query(By.css('hlm-alert'));
    expect(alert).toBeTruthy();
  });

  it('should use destructive variant by default', async () => {
    const { fixture } = await setup();

    const alert = fixture.debugElement.query(By.css('hlm-alert')).nativeElement as HTMLElement;
    expect(alert.className).toContain('text-destructive');
  });

  it('should support default variant', async () => {
    const { fixture } = await setup();

    fixture.componentRef.setInput('variant', 'default');
    fixture.detectChanges();

    const alert = fixture.debugElement.query(By.css('hlm-alert')).nativeElement as HTMLElement;
    expect(alert.className).not.toContain('text-destructive');
  });
});
