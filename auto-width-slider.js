import { gsap } from "gsap"

export default class AutoWidthSlider{

	constructor(element) {
		this.wrapper = element;
		this.slider = this.wrapper.querySelector('.js-auto-width-slider-slider');
		this.track = this.wrapper.querySelector('.js-auto-width-slider-track');
		this.slides = this.wrapper.querySelectorAll('.js-auto-width-slider-slide');
		this.left = this.wrapper.querySelector('.js-auto-width-slider-left');
		this.right = this.wrapper.querySelector('.js-auto-width-slider-right');

		this.gap = this.wrapper.getAttribute('data-gap') ? parseInt(this.wrapper.getAttribute('data-gap')) : 0;
		this.currentIndex = 0;
		this.maxIndex = this.slides.length - 1;
		this.isTouching = false;
		this.swipeVal = 0;
		this.currX = 0;
		this.inertiaStartTime = 0;
		this.hasTouch = this.wrapper.getAttribute('data-has-touch');
		this.mediaQuery = this.wrapper.getAttribute('data-media-query') ? this.wrapper.getAttribute('data-media-query') : false;
		this.isInit = false;

		if(this.mediaQuery){
			this.initByMediaQuery();
			this.bindEvents();
		}
		else{
			this.init();
		}
	}

	bindEvents(){
		let throttle = false;
		window.addEventListener('resize', () => {
			if(!throttle){
				this.initByMediaQuery();
				throttle = true;
				setTimeout(() => {
					throttle = false;
				}, 250)
			}
		})
	}

	init(){
		this.isInit = true;

		// Store them in properties to kill them if needed
		this.clickRightEventListener = this.onClickRight.bind(this);
		this.clickLeftEventListener = this.onClickLeft.bind(this);
		this.sliderKeyupEventListener = this.onPressTab.bind(this);
		this.sliderPointerDownEventListener = this.initSwipe.bind(this);
		this.sliderPointerMoveEventListener = this.handleSwipe.bind(this);
		this.sliderPointerUpLeaveEventListener = this.endSwipe.bind(this);


		this.right.addEventListener('click', this.clickRightEventListener);

		this.left.addEventListener('click', this.clickLeftEventListener);

		this.slider.addEventListener('keyup', this.sliderKeyupEventListener);

		if(this.hasTouch){
			this.slider.addEventListener('pointerdown', this.sliderPointerDownEventListener);

			this.slider.addEventListener('pointermove', this.sliderPointerMoveEventListener);

			this.slider.addEventListener('pointerleave', this.sliderPointerUpLeaveEventListener);

			this.slider.addEventListener('pointerup', this.sliderPointerUpLeaveEventListener);
		}
	}

	initByMediaQuery(){
		if(window.matchMedia(this.mediaQuery).matches){
			if(!this.isInit){
				this.init();
			}
		}
		else{
			if(this.isInit){
				this.kill();
			}
		}
	}

	kill(){
		this.isInit = false;
		gsap.set(this.track, {x:0});

		this.right.removeEventListener('click', this.clickRightEventListener);

		this.left.removeEventListener('click', this.clickLeftEventListener);

		this.slider.removeEventListener('keyup', this.sliderKeyupEventListener);

		if(this.hasTouch){
			this.slider.removeEventListener('pointerdown', this.sliderPointerDownEventListener);

			this.slider.removeEventListener('pointermove', this.sliderPointerMoveEventListener);

			this.slider.removeEventListener('pointerleave', this.sliderPointerUpLeaveEventListener);

			this.slider.removeEventListener('pointerup', this.sliderPointerUpLeaveEventListener);
		}
	}

	onClickLeft(e){
		e.preventDefault();
		this.decrementIndex();
	}

	onClickRight(e){
		e.preventDefault();
		this.incrementIndex();
	}

	onPressTab(e){
		if(e.keyCode == 9){
			[...this.slides].forEach((el,n) => {
				if(document.activeElement === el){
					this.currentIndex = n;
					this.applyTranslate();
				}
			})
		}
	}

	initSwipe(e){
		this.isTouching = true;
		this.swipeVal = e.pageX;
		this.inertiaStartTime = Date.now();
		this.currX = gsap.getProperty(this.track, 'x');
	}

	handleSwipe(e){
		if(this.isTouching){
			let currentSwipe = e.pageX;
			let valueToTranslate = this.currX +  Math.round(currentSwipe - this.swipeVal);
			gsap.set(this.track, {x:valueToTranslate}); // Move track along the cursor/finger
			this.rebuildIndexFromTranslate();
			if(!this.slider.classList.contains('is-swiping')){
				this.slider.classList.add('is-swiping');
			}
		}
	}

	endSwipe(e){
		if(this.isTouching){
			this.isTouching = false;
			let interval = Date.now() - this.inertiaStartTime;
			let velocity = (e.pageX - this.swipeVal) / (interval);
			if(velocity != 0){ // Click event;
				if(interval < 150){ // If the swipe was less than 150ms, just increment or decrement.
					if(velocity < 0 ){
						this.incrementIndex();
					}
					else{
						this.decrementIndex();
					}
				}
				else{ // If it was longer, apply some inertia and then determine new index
					this.applyInertia(velocity);
				}
			}
			this.slider.classList.remove('is-swiping');
		}
	}

	incrementIndex(){
		if(this.currentIndex < this.maxIndex){
			this.currentIndex += 1;
		}
		this.applyTranslate();
	}

	decrementIndex(){
		if(this.currentIndex > 0){
			this.currentIndex -= 1;
		}
		this.applyTranslate();
	}

	applyInertia(velocity){
		let distance = velocity * 100;
		let targetPosition = gsap.getProperty(this.track, 'x') + distance;
		this.rebuildIndexFromInertia(targetPosition);
		this.applyTranslate();
	}

	//Apply final track translate based on currentIndex
	applyTranslate(){
		let translate = 0;
		for (let i = 0; i < this.currentIndex; i++) {
			let width = this.slides[i].offsetWidth + this.gap;
			translate += width;
		}
		gsap.to(this.track, {x:-translate});
		this.updateActiveClasses();
	}

	updateActiveClasses(){
		[...this.slides].forEach((el) => {
			el.classList.remove('is-active');
		});

		this.slides[this.currentIndex].classList.add('is-active');
		this.left.disabled = this.currentIndex == 0;
		this.right.disabled = this.currentIndex == this.maxIndex;
	}

	// Rebuild index based on tracks's translate. Used AFTER pointer/touch is up
	rebuildIndexFromInertia(targetPosition){
		let width = 0;
		let midWidth = 0;
		let stop = false;
		targetPosition = targetPosition * -1;
		[...this.slides].forEach((el, n) => {
			if(stop){
				return;
			}
			width += el.offsetWidth + this.gap;
			midWidth = width - (el.offsetWidth / 2);
			if(midWidth >= targetPosition){
				this.currentIndex = n;
				stop = true;
			}
		});
		this.updateActiveClasses();
	}

	// Rebuild index based on tracks's translate. Used WHILE pointer/touch down and moving (live update is-active class);
	rebuildIndexFromTranslate(){
		let x = gsap.getProperty(this.track, 'x') * -1;
		let width = 0;
		let midWidth = 0;
		let stop = false;
		[...this.slides].forEach((el, n) => {
			if(stop){
				return;
			}
			width += el.offsetWidth + this.gap;
			midWidth = width - (el.offsetWidth / 2);
			if(this.currentIndex <= this.maxIndex){
				if(midWidth >= x){
					this.currentIndex = n;
					stop = true;
				}
			}
		});
		this.updateActiveClasses();
	}


}
