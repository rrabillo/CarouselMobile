class CarouselMobile{

    constructor(element, params){
        // UI
        this.$wrapper = element;
        this.$track = this.$wrapper.find('.js-carousel-mobile-track');
        this.$slides = this.$wrapper.find('.js-carousel-mobile-slide');
        this.$bullets = this.$wrapper.find('.js-carousel-mobile-bullet');


        //VARS
        this.stickToRight = params.stickToRight != undefined ? params.stickToRight : false;
        this.startAt = params.startAt != undefined ? params.startAt : 767;
        this.slideWidth = this.$slides.outerWidth();
        this.currentIndex = 0;
        this.maxIndex = this.$slides.length - 1;
        this.trackWidth = this.slideWidth * this.maxIndex;
        this.swipeVal = 0;
        this.swipeLength = 0;
        this.currentTranslate = 0;
        this.hasMoved = false;

        this.maxSlide = this.stickToRight ? (this.slideWidth * (this.maxIndex +1)) - this.$wrapper.width() : this.trackWidth;

        this.bindEvents();

    }


    bindEvents(){
        this.$wrapper.on('touchmove', (e) => {
            if(this.isMobile()){
                this.handleSwipe(e);
                this.hasMoved = true;
            }
        });
        this.$wrapper.on('touchstart', (e) => {
            if(this.isMobile()){
                this.initSwipe(e);
                this.hasMoved = false;
            }
        });
        this.$wrapper.on('touchend', (e) => {
            if(this.isMobile()) {
                if(this.hasMoved){
                    this.endSwipe(e);
                }
            }
        });
        $(window).on('resize', this.handleResize.bind(this));

        this.$bullets.on('click', (e) => {
            let $currentTarget = $(e.currentTarget);
            this.goToIndex($currentTarget.index());
        });
    }

    initSwipe(e){
        this.swipeVal = e.originalEvent.touches[0].pageX;
        this.currentTranslate = parseInt(this.$track.css('left')) ? parseInt(this.$track.css('left')) : 0;
    }

    endSwipe() {
        this.currentTranslate = parseInt(this.$track.css('left'));
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
        let currX = e.originalEvent.touches[0].pageX;
        let valueToTranslate = this.currentTranslate +  Math.round(currX - this.swipeVal);
        this.swipeLength = currX - this.swipeVal;
        this.$track.css('left',valueToTranslate);
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
        console.log(this.slideWidth);
        this.$track.css('transition', 'all 500ms');
        this.$track.css('left',-numberToSlide);
        setTimeout(() => {
            this.$track.css('transition', '');
        }, 500)

        this.updateBullets(this.currentIndex);
    }

    updateBullets(index){
        this.$bullets.removeClass('is-current');
        $(this.$bullets[index]).addClass('is-current');
    }

    isMobile(){
        return window.matchMedia("(max-width: "+this.startAt+"px)").matches;
    }

    handleResize(){
        // If mobile, update vars
        if(this.isMobile()){
            this.slideWidth = this.$slides.outerWidth();
            this.maxSlide = this.stickToRight ? (this.slideWidth * (this.maxIndex +1)) - this.$wrapper.width() : this.trackWidth;
        }
        else{
            this.$track.css('left',0);
            this.currentIndex = 0;
        }
    }
}
