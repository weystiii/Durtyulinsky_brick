document.addEventListener('DOMContentLoaded', () => {

// new Modal().open('second');


	const productsBtn = document.querySelectorAll('.product_btn');
	const cartProductsList = document.querySelector('.cart-content_list');
	const cart = document.querySelector('.cart');
	const cartQuantity = cart.querySelector('.cart_quantity');
	const fullPrice = document.querySelector('.fullprice');
	const orderModalOpenProd = document.querySelector('.order-modal__btn');
	const orderModalList = document.querySelector('.order-modal__list');
	let price = 0;
	let productArray = [];
	let randomId = 0;


	const priceWithoutSpaces = (str) => {
		return str.replace(/\s/g, '');
	};

	const normalPrice = (str) => {
		return String(str).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
	};

	const plusFullPrice = (currentPrice) => {
		return price += currentPrice;
	};

	const minusFullPrice = (currentPrice) => {
		return price -= currentPrice;
	};


	const printQuantity = () => {
		let length = cartProductsList.querySelector('.simplebar-content').children.length;
		cartQuantity.textContent = length;
		length > 0 ? cart.classList.add('active') : cart.classList.remove('active');
	};

	const printFullPrice = () => {
		fullPrice.textContent = `${normalPrice(price)} ₽`;
	};

	const generateCartProduct = (img, title, price, id) => {
		return `
			<li class="cart-content_item">
				<article class="cart-content_product cart-product" data-id="${id}">
					<img src="${img}" alt="" class="cart-product_img">
					<div class="cart-product_text">
						<h3 class="cart-product_title">${title}</h3>
						<span class="cart-product_price">${normalPrice(price)}</span>
					</div>
					<button class="cart-product_delete" aria-label="Удалить товар"></button>
				</article>
			</li>
		`;
	};

	const deleteProducts = (productParent) => {
		let id = productParent.querySelector('.cart-product').dataset.id;
		document.querySelector(`.product[data-id="${id}"]`).querySelector('.product_btn').disabled = false;
		
		let currentPrice = parseInt(priceWithoutSpaces(productParent.querySelector('.cart-product_price').textContent));
		minusFullPrice(currentPrice);
		printFullPrice();
		productParent.remove();

		printQuantity();

		updateStorage();
	};

	productsBtn.forEach(el => {
		el.closest('.product').setAttribute('data-id', randomId++);

		el.addEventListener('click', (e) => {
			let self = e.currentTarget;
			let parent = self.closest('.product');
			let id = parent.dataset.id;
			let img = parent.querySelector('.image-switch_img img').getAttribute('src');
			let title = parent.querySelector('.product_title').textContent;
			let priceString = priceWithoutSpaces(parent.querySelector('.product-price_cerrent').textContent);
			let priceNumber = parseInt(priceWithoutSpaces(parent.querySelector('.product-price_cerrent').textContent));

			plusFullPrice(priceNumber);


			printFullPrice();

			cartProductsList.querySelector('.simplebar-content').insertAdjacentHTML('afterbegin', generateCartProduct(img, title, priceNumber, id));
			printQuantity();

			updateStorage();

			/*self.disabled = true;*/
		});
	});

	cartProductsList.addEventListener('click', (e) => {
		if (e.target.classList.contains('cart-product_delete')) {
			deleteProducts(e.target.closest('.cart-content_item'));
		}
	});

	/*когда можно перейти к оформлению заказа*/
	let flag = 0;
	orderModalOpenProd.addEventListener('click', (e) => {
		if (flag == 0) {
			orderModalOpenProd.classList.add('open');
			orderModalList.style.display = 'block';
			flag = 1;
		} else {
			orderModalOpenProd.classList.remove('open');
			orderModalList.style.display = 'none';
			flag = 0;
		}
	});


	const generateModalProduct = (img, title, price, id) => {
		return `
			<li class="order-modal__item">
				<article class="order-modal__product order-product" data-id="${id}">
					<img src="${img}" alt="" class="order-product__img">
					<div class="order-product__text">
						<h3 class="order-product__title">${title}</h3>
						<span class="order-product__price">${normalPrice(price)}</span>
					</div>
				</article>
			</li>
		`;
	};

	/*модальное окно*/
	class GraphModal {
		constructor(options) {
			let defaultOptions = {
				isOpen: ()=>{},
				isClose: ()=>{},
			}
			this.options = Object.assign(defaultOptions, options);
			this.modal = document.querySelector('.modal');
			this.speed = 300;
			this.animation = false;
			this.reOpen = false;
			this.nextWindow = false;
			this.modalContainer = false;
			this.isOpened = false;
			this.previousActiveElement = false;
			this._focusElements = [
					'a[href]',
					'area[href]',
					'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
					'select:not([disabled]):not([aria-hidden])',
					'textarea:not([disabled]):not([aria-hidden])',
					'button:not([disabled]):not([aria-hidden])',
					'iframe',
					'object',
					'embed',
					'[contenteditable]',
					'[tabindex]:not([tabindex^="-"])'
			];
			this.fixBlocks = document.querySelectorAll('.fix-block');
			this.events();
		}

		events() {
			document.addEventListener('click', function(e) {
			 	const clickedElement = e.target.closest(`[data-graph-path]`);
			 	if (clickedElement) {
					let target = clickedElement.dataset.graphPath;
					let animation = clickedElement.dataset.graphAnimation;
					let speed =  clickedElement.dataset.graphSpeed;
					this.animation = animation ? animation : 'fade';
					this.speed = speed ? parseInt(speed) : 300;
					this.nextWindow = document.querySelector(`[data-graph-target="${target}"]`); 
					this.open();
					return;
				}

				if (e.target.closest('.modal__close')) {
					this.close();
					return;
				}
			}.bind(this));

			window.addEventListener('keydown', function(e) {
				if (e.keyCode == 27) {
					if (this.modalContainer.classList.contains('modal-open')) {
						this.close();
					}
				}

				if (e.which == 9 && this.isOpened) {
					this.focusCatch(e);
					return;
				}
			}.bind(this));

			this.modal.addEventListener('click', function(e) {
				if (!e.target.classList.contains('modal__container') && !e.target.closest('.modal__container') && this.isOpened) {
					this.close();
				}
			}.bind(this));
		}

		open(selector) {
			this.previousActiveElement = document.activeElement;

			if (this.isOpened) {
				this.reOpen = true;
				this.close();
				return;
			}

			this.modalContainer = this.nextWindow;

			if (selector) {
				this.modalContainer = document.querySelector(`[data-graph-target="${selector}"]`);
			}

			this.modal.style.setProperty('--transition-time', `${this.speed / 1000}s`);
			this.modal.classList.add('is-open');
			this.disableScroll();
			
			this.modalContainer.classList.add('modal-open');
			this.modalContainer.classList.add(this.animation);
			
			setTimeout(() => {
				this.options.isOpen(this);
				this.modalContainer.classList.add('animate-open');
				this.isOpened = true;
				this.focusTrap();
			}, this.speed);
		}
		
		close() {
			if (this.modalContainer) {
				this.modalContainer.classList.remove('animate-open');
				this.modalContainer.classList.remove(this.animation);
				this.modal.classList.remove('is-open');
				this.modalContainer.classList.remove('modal-open');
				
				this.enableScroll();
				this.options.isClose(this);
				this.isOpened = false;
				this.focusTrap();

				if (this.reOpen) {
					this.reOpen = false;
					this.open();
				}
			}
		}

		focusCatch(e) {
			const nodes = this.modalContainer.querySelectorAll(this._focusElements);
			const nodesArray = Array.prototype.slice.call(nodes);
			const focusedItemIndex = nodesArray.indexOf(document.activeElement)
			if (e.shiftKey && focusedItemIndex === 0) {
				nodesArray[nodesArray.length - 1].focus();
				e.preventDefault();
			}
			if (!e.shiftKey && focusedItemIndex === nodesArray.length - 1) {
				nodesArray[0].focus();
				e.preventDefault();
			}
		}

		focusTrap() {
			const nodes = this.modalContainer.querySelectorAll(this._focusElements);
			if (this.isOpened) {
				if (nodes.length) nodes[0].focus();
			} else {
				this.previousActiveElement.focus();
			}
		}

		disableScroll() {
			let pagePosition = window.scrollY;
			this.lockPadding();
			document.body.classList.add('disable-scroll');
			document.body.dataset.position = pagePosition;
			document.body.style.top = -pagePosition + 'px';
		}

		enableScroll() {
			let pagePosition = parseInt(document.body.dataset.position, 10);
			this.unlockPadding();
			document.body.style.top = 'auto';
			document.body.classList.remove('disable-scroll');
			window.scroll({
				top: pagePosition,
				left: 0
			});
			document.body.removeAttribute('data-position');
		}

		lockPadding() {
			let paddingOffset = window.innerWidth - document.body.offsetWidth + 'px';
			this.fixBlocks.forEach((el) => {
				el.style.paddingRight = paddingOffset;
			});
			document.body.style.paddingRight = paddingOffset;
		}

		unlockPadding() {
			this.fixBlocks.forEach((el) => {
				el.style.paddingRight = '0px';
			});
			document.body.style.paddingRight = '0px';
		}
	}

	/*открытие модального окна*/
	const modal = new GraphModal({
		isOpen: (modal) => {
			console.log('opened');
			let array = cartProductsList.querySelector('.simplebar-content').children;
			let fullprice = fullPrice.textContent;
			let length = array.length;

			document.querySelector('.order-modal__quantity span').textContent = `${length} шт`;
			document.querySelector('.order-modal__summ span').textContent = `${fullprice}`;
			for (item of array) {
				console.log(item)
				let img = item.querySelector('.cart-product_img').getAttribute('src');
				let title = item.querySelector('.cart-product_title').textContent;
				let priceString = priceWithoutSpaces(item.querySelector('.cart-product_price').textContent);
				let id = item.querySelector('.cart-product').dataset.id;

				orderModalList.insertAdjacentHTML('afterbegin', generateModalProduct(img, title, priceString, id));

				let obj = {};
				obj.title = title;
				obj.price = priceString;
				productArray.push(obj);
			}

			console.log(productArray)
		},
		isClose: () => {
			console.log('closed');
		}
	});

	/*отправка данных*/
	document.querySelector('.order').addEventListener('submit', (e) => {
		e.preventDefault();
		let self = e.currentTarget;

		let formData = new FormData(self);
		let name = self.querySelector('[name="Имя"]').value;
		let tel = self.querySelector('[name="Телефон"]').value;
		let mail = self.querySelector('[name="Email"]').value;
		formData.append('Товары', JSON.stringify(productArray));
		formData.append('Имя', name);
		formData.append('Телефон', tel);
		formData.append('Email', mail);

		let xhr = new XMLHttpRequest();

		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					console.log('Отправлено');
				}
			}
		}

		xhr.open('POST', 'mail.php', true);
		xhr.send(formData);

		self.reset();
	});


	/*--------------------------------------------------------*/
	const countSumm = () => {
			document.querySelectorAll('.cart-content_item').forEach(el => {
				price += parseInt(priceWithoutSpaces(el.querySelector('.cart-product_price').textContent));
			});
		};

	const initialState = () => {
		if (localStorage.getItem('products') !== null){
			console.log(localStorage.getItem('products'));
			cartProductsList.querySelector('.simplebar-content').innerHTML = localStorage.getItem('products');
			printQuantity();
			countSumm();
			printFullPrice();

			document.querySelectorAll('.cart-content').forEach(el => {
					let id = el.dataset.id;
					console.log(id)
					document.querySelector(`.product[data-id="${id}"]`).querySelector('.product_btn').disabled = falce;
				});
			}
		};


	const updateStorage = () => {
			let parent = cartProductsList.querySelector('.simplebar-content');
			let html = parent.innerHTML;
			html = html.trim();
			console.log(html)
			console.log(html.length)
			if (html.length){
				localStorage.setItem('products', html);
			} else{
				localStorage.remove('products', html);
			}
		};
		

	

/*Отправка данных*/
	document.querySelector('.modal').addEventListener('click', (e) => {
			if (e.target.classList.contains('order-product__delete')) {
				let id = e.target.closest('.order-modal__product').dataset.id;
				let cartProduct = document.querySelector(`.cart-content__product[data-id="${id}"]`).closest('.cart-content__item');
				deleteProducts(cartProduct)
				e.target.closest('.order-modal__product').remove();
			}
		});

});
