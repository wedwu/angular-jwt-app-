import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
export interface ConfirmDialogData { title: string; message: string; confirm: string; }
@Component({
  selector: 'app-confirm-dialog',
  template: `<h2 mat-dialog-title>{{ data.title }}</h2><mat-dialog-content>{{ data.message }}</mat-dialog-content><mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-raised-button color="warn" [mat-dialog-close]="true">{{ data.confirm }}</button></mat-dialog-actions>`,
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData, public ref: MatDialogRef<ConfirmDialogComponent>) {}
}
