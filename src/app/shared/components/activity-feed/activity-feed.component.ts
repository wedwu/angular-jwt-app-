import { Component, Input } from '@angular/core';
import { ActivityLog } from '@/core/services/api.service';
@Component({
  selector: 'app-activity-feed',
  template: `<div class="feed"><div class="item" *ngFor="let a of items"><mat-icon [style.color]="color(a.type)">{{ icon(a.type) }}</mat-icon><div class="text"><span class="action">{{ a.action }}</span><span class="meta">{{ a.user }} &middot; {{ timeAgo(a.timestamp) }}</span></div></div><div class="empty" *ngIf="!items.length">No activity yet.</div></div>`,
  styles: [`.feed{display:flex;flex-direction:column;gap:14px;padding-top:8px}.item{display:flex;align-items:flex-start;gap:12px}mat-icon{flex-shrink:0;font-size:20px;width:20px;height:20px;margin-top:2px}.text{display:flex;flex-direction:column;gap:2px}.action{font-size:.87rem;color:#333}.meta{font-size:.76rem;color:#888}.empty{color:#aaa;font-size:.88rem;text-align:center;padding:20px 0}`],
})
export class ActivityFeedComponent {
  @Input() items: ActivityLog[] = [];
  icon(t: string): string { return ({success:'check_circle',warning:'warning',error:'cancel',info:'info'} as any)[t]??'info'; }
  color(t: string): string { return ({success:'#43a047',warning:'#fb8c00',error:'#e53935',info:'#1e88e5'} as any)[t]??'#1e88e5'; }
  timeAgo(ts: string): string {
    const d = Math.floor((Date.now() - new Date(ts).getTime())/1000);
    if(d<60) return d+'s ago'; if(d<3600) return Math.floor(d/60)+'m ago'; if(d<86400) return Math.floor(d/3600)+'h ago'; return Math.floor(d/86400)+'d ago';
  }
}
