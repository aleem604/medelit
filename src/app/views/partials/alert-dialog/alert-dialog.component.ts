import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';

@Component({
	selector: 'alert-dialog',
	templateUrl: './alert-dialog.component.html',
	styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent implements OnInit {
	title: string;
	message: string;

	constructor(public dialogRef: MatDialogRef<AlertDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel) {
		// Update view with given values
		this.title = data.title;
		this.message = data.message;
	}

	ngOnInit() {
	}

	onConfirm(): void {
		// Close the dialog, return true
		this.dialogRef.close(true);
	}

	onDismiss(): void {
		// Close the dialog, return false
		this.dialogRef.close(false);
	}
}

export class ConfirmDialogModel {

	constructor(public title: string, public message: string) {
	}
}
