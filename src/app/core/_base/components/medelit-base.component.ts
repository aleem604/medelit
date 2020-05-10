import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker/bs-datepicker.config';
import * as moment from 'moment';

export class MedelitBaseComponent {
	datePickerConfig: Partial<BsDatepickerConfig>;
	constructor() {
	this.datePickerConfig =	Object.assign({}, {
			containerClass: 'theme-dark-blue',
			dateInputFormat: 'DD/MM/YYYY',
			isAnimated: true,
			adaptivePosition: true
		});
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



}
