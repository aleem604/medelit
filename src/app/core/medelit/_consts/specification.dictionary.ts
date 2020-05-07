

export const SPECIFICATIONS_DICTIONARY: string[] = [
    'Seats',
    'Fuel Type',
    'Stock',
    'Door count',
    'Engine',
    'Transmission',
    'Drivetrain',
    'Combined MPG',
    'Warranty',
    'Wheels'
];

export const urlReg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

export const DATE_FORMAT = {
	parse: {
		dateInput: 'DD.MM.YYYY',
	},
	display: {

		dateInput: 'DD.MM.YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM-YYYY',
	},
};

const MOMENT_FORMATS = {
	parse: {
		dateInput: 'DD/MM/YYYY',
	},
	display: {
		dateInput: 'DD/MM/YYYY',
		monthYearLabel: 'YYYY',
		dateA11yLabel: 'DD/MM/YYYY',
		monthYearA11yLabel: 'YYYY',
	},
};
