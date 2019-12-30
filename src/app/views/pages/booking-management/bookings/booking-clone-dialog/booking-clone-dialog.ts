import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'booking-clone-dialog',
	templateUrl: 'booking-clone-dialog.html',
})
export class BookingCloneDialog {

  constructor(
	  public dialogRef: MatDialogRef<BookingCloneDialog>,
	  @Inject(MAT_DIALOG_DATA) public data: {copies:number}) {}

	onCancel(): void {
    this.dialogRef.close();
  }

}
