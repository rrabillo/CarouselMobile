export default class CarouselMobile{

    constructor(element, params){
        // UI
        this.elWrapper = element;
        this.elTrack = this.elWrapper.querySelectorAll('.js-carousel-mobile-track')[0];
        this.elSlides = this.elWrapper.querySelectorAll('.js-carousel-mobile-item');
        this.elBullets = this.elWrapper.querySelectorAll('.js-carousel-mobile-bullet');

        if(this.elSlides.length){
            //VARS
            this.stickToRight = params.stickToRight != undefined ? params.stickToRight : false;
            this.startAt = params.startAt != undefined ? params.startAt : 767;
            this.slideWidth = this.elSlides[0].offsetWidth
            this.currentIndex = 0;
            this.maxIndex = this.elSlides.length - 1;
            this.trackWidth = this.slideWidth * this.maxIndex;
            this.swipeVal = 0;
            this.swipeLength = 0;
            this.currentTranslate = 0;
            this.hasMoved = false;

            this.maxSlide = this.stickToRight ? (this.slideWidth * (this.maxIndex +1)) - this.elWrapper.offsetWidth : this.trackWidth;

            this.elTrack.style.position = "relative";
            this.bindEvents();
        }

    }


    bindEvents(){
        this.elWrapper.addEventListener('touchmove', (e) => {
            if(this.isMobile()){
                this.handleSwipe(e);
                this.hasMoved = true;
            }
        })
        this.elWrapper.addEventListener('touchstart', (e) => {
            if(this.isMobile()){
                this.initSwipe(e);
                this.hasMoved = false;
            }
        })
        this.elWrapper.addEventListener('touchend', (e) => {
            if(this.isMobile()) {
                if(this.hasMoved){
                    this.endSwipe(e);
                }
            }
        })
        window.addEventListener('resize', app.throttle(this.handleResize.bind(this)));
        app.nodesEventListener('click', this.elBullets, (el, i, e) => {
            this.goToIndex(i);
        });
    }

    initSwipe(e){
        this.swipeVal = e.touches[0].pageX;
        this.currentTranslate = parseInt(getComputedStyle(this.elTrack)['left']) ? parseInt(getComputedStyle(this.elTrack)['left']) : 0;
    }

    endSwipe() {
        this.currentTranslate = parseInt(getComputedStyle(this.elTrack)['left']);
        let indexToGo;
        if(this.swipeLength > 80){
            indexToGo = this.currentIndex === 0 ? 0 : this.currentIndex - 1;
        }
        else if(this.swipeLength < -80){
            indexToGo = this.currentIndex === this.maxIndex ? this.maxIndex : this.currentIndex + 1;
        }
        else{
            indexToGo = this.currentIndex;
        }
        this.goToIndex(indexToGo);
    }

    handleSwipe(e){
        let currX = e.touches[0].pageX;
        let valueToTranslate = this.currentTranslate +  Math.round(currX - this.swipeVal);
        this.swipeLength = currX - this.swipeVal;
        this.elTrack.style.left = valueToTranslate+'px';
    }

    goToIndex(index){
        this.currentIndex = index;
        this.swipeSlides();
    }

    incrementIndex(){
        this.currentIndex = this.currentIndex == this.maxIndex ? this.maxIndex : this.currentIndex+1;
        this.swipeSlides();
    }

    decrementIndex(){
        this.currentIndex = this.currentIndex === 0 ? 0 : this.currentIndex - 1;
    }

    swipeSlides() {
        let numberToSlide = this.slideWidth * this.currentIndex;
        if(numberToSlide > this.maxSlide){
            numberToSlide = this.maxSlide;
        }
        if(numberToSlide < 0 ){
            numberToSlide = 0;
        }
        this.elTrack.style.transition = 'all 500ms';
        this.elTrack.style.left = -numberToSlide+'px';
        setTimeout(() => {
            this.elTrack.style.transition = '';
        }, 500)

        if(this.elBullets.length){
            this.updateBullets(this.currentIndex);
        }
    }

    updateBullets(index){
        app.nodesRemoveClass(this.elBullets, 'is-current');
        this.elBullets[index].classList.add('is-current');
    }

    isMobile(){
        return window.matchMedia("(max-width: "+this.startAt+"px)").matches;
    }

    handleResize(){
        if(this.isMobile()){
            this.slideWidth = this.elSlides[0].offsetWidth;
            this.maxSlide = this.stickToRight ? (this.slideWidth * (this.maxIndex +1)) - this.elWrapper.offsetWidth : this.trackWidth;
        }
        this.elTrack.style.left = '';
        this.currentIndex = 0;
    }
}
