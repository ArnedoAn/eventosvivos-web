import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';

import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(SpinnerComponent);
    fixture.detectChanges();
    return { fixture, component: fixture.componentInstance };
  }

  it('should render hlm-spinner', async () => {
    const { fixture } = await setup();

    const spinner = fixture.debugElement.query(By.css('hlm-spinner'));
    expect(spinner).toBeTruthy();
  });

  it('should default to md size', async () => {
    const { fixture } = await setup();

    const spinner = fixture.debugElement.query(By.css('hlm-spinner')).nativeElement as HTMLElement;
    expect(spinner.className).toContain('text-[length:--spacing(4)]');
  });

  it('should apply sm size', async () => {
    const { fixture } = await setup();

    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('hlm-spinner')).nativeElement as HTMLElement;
    expect(spinner.className).toContain('text-[length:--spacing(3)]');
  });

  it('should apply lg size', async () => {
    const { fixture } = await setup();

    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();

    const spinner = fixture.debugElement.query(By.css('hlm-spinner')).nativeElement as HTMLElement;
    expect(spinner.className).toContain('text-[length:--spacing(6)]');
  });
});
