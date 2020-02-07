import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { LeadCSVModel, LeadsService } from '../../../core/medelit';
import * as _ from 'lodash';
@Component({
	selector: 'csv-file-upload-dialog',
	templateUrl: './csv-file-upload.dialog.component.html',
	styleUrls: ['./csv-file-upload.dialog.component.scss']
})
export class CSVFileUploadDialogComponent implements OnInit {
	title: string;
	message: string;
	error: string;
	file: any;
	leads = [];
	loading: boolean = false;
	hasFormErrors: boolean = false;
	constructor(public dialogRef: MatDialogRef<CSVFileUploadDialogComponent>,
		private papa: Papa,
		@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel,
		private leadService: LeadsService
	) {
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

	ConvertCSVtoJSON() {
		if (this.leads.length == 0) return;
		this.loading = true;
		this.leadService.bulkUploadLeadsByCSV(this.leads).toPromise().then((res) => {
			if (res.success) {
				this.dialogRef.close(res.data);
			} else {
				this.error = res.errors as unknown as string;
				this.hasFormErrors = true;
			}
		}).catch((e) => {
			this.error = e;
			this.hasFormErrors = true;
		}).finally(() => {
			this.loading = false;
		});

	}

	handleFileSelect(evt) {
		this.error = '';
		this.leads = [];
		const files = evt.target.files; // FileList object
		this.file = files[0];

		if (!_.endsWith(this.file.name, '.csv')) {
			this.error = "Invlaid file format";
			this.hasFormErrors = true;
			return;
		}

		var reader = new FileReader();
		reader.readAsText(this.file);
		reader.onload = (event: any) => {
			var csv = event.target.result; // Content of CSV file
			this.papa.parse(csv, {
				skipEmptyLines: true,
				header: true,
				complete: (results) => {
					for (let i = 0; i < results.data.length; i++) {
						var lead = new LeadCSVModel();
						lead.surName = results.data[i][results.meta.fields[0]];
						lead.title = results.data[i][results.meta.fields[1]];
						lead.name = results.data[i][results.meta.fields[2]];
						lead.mainPhone = results.data[i][results.meta.fields[3]];
						lead.mainPhoneOwner = results.data[i][results.meta.fields[4]];
						lead.phone2 = results.data[i][results.meta.fields[5]];
						lead.phone3 = results.data[i][results.meta.fields[6]];
						lead.phone2Owner = results.data[i][results.meta.fields[7]];
						lead.phone3Owner = results.data[i][results.meta.fields[8]];
						lead.contactPhone = results.data[i][results.meta.fields[9]];
						lead.visitRequestingPerson = results.data[i][results.meta.fields[10]];
						lead.visitRequestingPersonRelation = results.data[i][results.meta.fields[11]];
						lead.fax = results.data[i][results.meta.fields[12]];
						lead.email = results.data[i][results.meta.fields[13]];
						lead.leadSource = results.data[i][results.meta.fields[14]];
						lead.leadStatus = results.data[i][results.meta.fields[15]];
						lead.language = results.data[i][results.meta.fields[16]];
						lead.leadCategory = results.data[i][results.meta.fields[17]];
						lead.contactMethod = results.data[i][results.meta.fields[18]];
						lead.dateOfBirth = results.data[i][results.meta.fields[19]];
						lead.countryOfBirth = results.data[i][results.meta.fields[20]];
						lead.preferredPaymentMethod = results.data[i][results.meta.fields[21]];
						lead.invoicingNotes = results.data[i][results.meta.fields[22]];
						lead.insuranceCover = results.data[i][results.meta.fields[23]];
						lead.listedDiscountNetwork = results.data[i][results.meta.fields[24]];
						lead.discount = results.data[i][results.meta.fields[25]];
						lead.gpCode = results.data[i][results.meta.fields[26]];
						lead.addressStreetName = results.data[i][results.meta.fields[27]];
						lead.postalCode = results.data[i][results.meta.fields[28]];
						lead.city = results.data[i][results.meta.fields[29]];
						lead.country = results.data[i][results.meta.fields[30]];
						lead.buildingType = results.data[i][results.meta.fields[31]];
						lead.flatNumber = results.data[i][results.meta.fields[32]];
						lead.buzzer = results.data[i][results.meta.fields[33]];
						lead.floor = results.data[i][results.meta.fields[34]];
						lead.visitVenue = results.data[i][results.meta.fields[35]];
						lead.addressNotes = results.data[i][results.meta.fields[36]];
						lead.visitVenueDetail = results.data[i][results.meta.fields[37]];
						lead.leadDescription = results.data[i][results.meta.fields[38]];
						lead.bankName = results.data[i][results.meta.fields[39]];
						lead.accountNumber = results.data[i][results.meta.fields[40]];
						lead.sortCode = results.data[i][results.meta.fields[41]];
						lead.iban = results.data[i][results.meta.fields[42]];
						lead.email2 = results.data[i][results.meta.fields[43]];
						lead.blacklist = results.data[i][results.meta.fields[44]];

						this.leads.push(lead);
					}
					//// console.log(this.test);
					//console.log('Parsed: k', this.leads);
				}
			});
		}
	}

	onAlertClose($event) {
		this.hasFormErrors = false;
	}
}

export class ConfirmDialogModel {

	constructor(public title: string, public message: string) {
	}
}
