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
			return moment(date).format('DD/MM/YYYY hh:mm a');
		else
			return date;
	}

	setTime(date: string) {
		var time = new Date(date);
		var d = new Date();
		d.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
		return d;
	}


	formatDateTime(date: string) {
		if (date)
			return moment(date).format('DD/MM/YYYY hh:mm a');
		else
			return date;
	}

	toDateFormat(date: string) {
		if (date)
			return moment(date, 'DD-MM-YYYY hh:mm a').format('MM-DD-YYYY hh:mm a');
		else
			return date;
	}

	toTimeFormat(date: string) {
		if (date)
			return moment(date, 'hh:mm a').format('hh:mm a');
		else
			return date;
	}

	 toDec(val: any) {
		if (val)
			return parseFloat(val).toFixed(2);
		else
			return val;
	}

	formatDateWithTimeToServer(date: string, dateWithTime: string) {
		if (date) {
			var st = new Date(moment(date, 'DD-MM-YYYY hh:mm a').format('MM-DD-YYYY hh:mm a'));
			var time = new Date(dateWithTime);

			st.setHours(time.getHours(), time.getMinutes(), time.getSeconds());

			return moment(st, 'DD-MM-YYYY hh:mm a').format('MM-DD-YYYY hh:mm a');
		}
		return date;
	}



}
