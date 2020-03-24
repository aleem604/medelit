import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'booking-cycle-dialog',
	templateUrl: 'booking-cycle-dialog.html',
	styleUrls: ['booking-cycle-dialog.scss'],
})
export class BookingCycleDialog implements OnInit {
	cloneControl: FormControl;
  constructor(
	  public dialogRef: MatDialogRef<BookingCycleDialog>,
	  @Inject(MAT_DIALOG_DATA) public data: {cycles:number}) {}

	ngOnInit() {
		this.cloneControl = new FormControl(this.data.cycles, [Validators.required, Validators.min(5)]);
	}



	onCancel(): void {
    this.dialogRef.close();
  }

}
