import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-stat-card',
  template: `<mat-card class="stat-card"><div class="inner"><div class="icon-wrap" [style.background]="color+'18'" [style.color]="color"><mat-icon>{{ icon }}</mat-icon></div><div><div class="value">{{ prefix }}{{ value | number }}{{ suffix }}</div><div class="label">{{ label }}</div></div></div></mat-card>`,
  styles: [`.stat-card{border-radius:12px!important}.inner{display:flex;align-items:center;gap:16px;padding:20px}.icon-wrap{width:52px;height:52px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}mat-icon{font-size:26px;width:26px;height:26px}.value{font-size:1.8rem;font-weight:800;color:#222;line-height:1}.label{font-size:.78rem;color:#888;margin-top:4px}`],
})
export class StatCardComponent {
  @Input() label  = '';
  @Input() value  = 0;
  @Input() icon   = 'star';
  @Input() color  = '#3f51b5';
  @Input() prefix = '';
  @Input() suffix = '';
}
