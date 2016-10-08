import util from './src/util';
import Modal from './src/modal';

class App {
	constructor () {
		console.log(`sum: ${util.sum(2,2)}`);

		let menu = document.querySelectorAll('.btn-outline-primary');
		let navs = document.querySelectorAll('.nav-item');

		let buttons = [...menu, ...navs];

		for (let i = buttons.length - 1; i >= 0; i--) {
			buttons[i].addEventListener('click', () => {
				Modal.show('Spread syntax, Wait for it !');
			});
		}
	}
}

// debug
window.app = new App();
