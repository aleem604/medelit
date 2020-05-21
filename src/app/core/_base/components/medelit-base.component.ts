import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker/bs-datepicker.config';
import * as moment from 'moment';
import { DatepickerDateCustomClasses } from 'ngx-bootstrap/datepicker/models';

export class MedelitBaseComponent {
	datePickerConfig: Partial<BsDatepickerConfig>;
	dateCustomClasses: DatepickerDateCustomClasses[];
	constructor() {
	this.datePickerConfig =	Object.assign({}, {
			containerClass: 'theme-dark-blue',
			dateInputFormat: 'DD/MM/YYYY',
			isAnimated: true,
			adaptivePosition: true
	});

		const now = new Date();
		const twoDaysAhead = new Date();
		twoDaysAhead.setDate(now.getDate() + 2);
		const fourDaysAhead = new Date();
		fourDaysAhead.setDate(now.getDate() + 4);

		this.dateCustomClasses = [
			{ date: now, classes: ['bg-calendar-current'] },
			//{ date: twoDaysAhead, classes: ['bg-warning'] },
			//{ date: fourDaysAhead, classes: ['bg-danger', 'text-warning'] }
		];


	}

	formatDate(date: string) {
		if (date)
			return moment(date).format('DD/MM/YYYY');
		else
			return date;
	}

	toDateFormat(date: string) {
		if (date)
			return moment(date, 'DD-MM-YYYY').format('MM-DD-YYYY');
		else
			return date;
	}

	 toDec(val: any) {
		if (val)
			return parseFloat(val).toFixed(2);
		else
			return val;
	}

}
