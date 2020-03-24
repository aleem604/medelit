// Angular
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
	templateUrl: './bookings.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingsComponent implements OnInit {
	constructor() {}
	ngOnInit() {}
}
