import swal from 'sweetalert/lib/sweetalert';

export default class Modal {
	constructor() {}

	get showModal() {
		return window.localStorage.getItem('show_modal');
	}

	set showModal(value) {
		window.localStorage.setItem('show_modal', value);
	}

	static show(title) {

		swal({
			title: title
		});
	}

}
