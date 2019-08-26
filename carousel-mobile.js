import { TweenMax } from 'gsap/TweenMax';

export default class CarouselMobile{

    constructor(element, params){

        // UI
        this.$wrapper = element;
        this.$track = this.$wrapper.find('.js-carousel-mobile-track');
        this.$slides = this.$wrapper.find('.js-carousel-mobile-slide');

        //VARS
        this.stickToRight = params.stickToRight != undefined ? params.stickToRight : false;
        this.startAt = params.startAt != undefined ? params.startAt : 767;
        this.slideWith = this.$slides.outerWidth();
        this.currentIndex = 0;
        this.maxIndex = this.$slides.length - 1;
        this.trackWidth = this.slideWith * this.maxIndex;
        this.swipeVal = 0;
        this.currentTranslate = 0;
        this.maxSlide = this.stickToRight ? (this.slideWith * (this.maxIndex +1)) - this.$wrapper.width() : this.trackWidth;

        this.bindEvents();

    }


    bindEvents(){
        this.$wrapper.on('touchmove', (e) => {
            if(this.isMobile()){
                this.handleSwipe(e);
            }
        });
        this.$wrapper.on('touchstart', (e) => {
            if(this.isMobile()){
                this.initSwipe(e);
            }
        });
        this.$wrapper.on('touchend', (e) => {
            if(this.isMobile()) {
                this.endSwipe(e);
            }
        });
        $(window).on('resize', this.handleResize.bind(this));
    }

    initSwipe(e){
        this.swipeVal = e.touches[0].pageX;
        this.currentTranslate = this.$track[0]._gsTransform != undefined ? this.$track[0]._gsTransform.x : 0;
    }

    endSwipe() {
        this.currentTranslate = this.$track[0]._gsTransform.x;

        let indexToGo = -(this.currentTranslate) / this.slideWith;
        indexToGo = Math.round(indexToGo);
        this.goToIndex(indexToGo);
    }

    handleSwipe(e){
        let currX = e.touches[0].pageX;
        let valueToTranslate = this.currentTranslate +  Math.round(currX - this.swipeVal);
        TweenMax.set(this.$track, {x:valueToTranslate});
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
        let numberToSlide = this.slideWith * this.currentIndex;
        if(numberToSlide > this.maxSlide){
            numberToSlide = this.maxSlide;
        }
        if(numberToSlide < 0 ){
            numberToSlide = 0;
        }
        TweenMax.to(this.$track, 0.5, {x: - numberToSlide, ease: Power2.easeOut});
    }

    isMobile(){
        return window.matchMedia("(max-width: "+this.startAt+"px)").matches;
    }

    handleResize(){
        // If mobile, update vars
        if(this.isMobile()){
            this.slideWith = this.$slides.outerWidth();
            this.maxSlide = this.stickToRight ? (this.slideWith * (this.maxIndex +1)) - this.$wrapper.width() : this.trackWidth;
        }
        else{
            TweenMax.set(this.$track, {x:0});
            this.currentIndex = 0;
        }
    }
}
