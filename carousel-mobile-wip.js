export default class CarouselMobile{

    constructor(element, options) {

        this.elWrapper = element;
        this.elTrack = this.elWrapper.querySelectorAll('.js-carousel-mobile-track')[0];
        this.elSlides = this.elWrapper.querySelectorAll('.js-carousel-mobile-item');

        this.options = {
            cssProp:"transform",
            mode:"free"
        }

        this.options = {...this.options, ...options};
        this.throttledResize = false;

        this.bindEvents();
        this.init();
    }

    bindEvents(){
        window.addEventListener('resize', this.onResize.bind(this));

        this.elTrack.addEventListener('touchstart', (e) => {
            if(this.currBreakpoint){
                this.onTouchStart(e);
            }
        })
        this.elTrack.addEventListener('touchmove', (e) => {
            if(this.currBreakpoint){
                this.onTouchMove(e);
            }
        })
        this.elTrack.addEventListener('touchend', (e) => {
            if(this.currBreakpoint){
                this.onTouchEnd(e);
            }
        })
    }

    init(){
        this.index = 0;
        this.maxIndex = this.elSlides.length - 1;
        this.slides = this.buildSlidesArray();
        this.resetPosition();
        let currBreakpoint = this.getCurrentBreakpoint();
        this.currBreakpoint = currBreakpoint ? this.options.breakpoints[currBreakpoint] : false;
        if(this.currBreakpoint){
            this.trackWidth = this.getTrackWidth();
            this.maxX = this.getMaxX();
            this.cssProp = this.currBreakpoint.cssProp ? this.currBreakpoint.cssProp : this.options.cssProp;
            this.setStyles();
        }
    }

    getCurrentBreakpoint(){
        let currWindowSize = window.innerWidth;
        let breakPointArray = Object.keys(this.options.breakpoints);
        let currentBreakPoint = breakPointArray.filter(element => { return element >= currWindowSize });
        currentBreakPoint =  currentBreakPoint.length ? Math.min(...currentBreakPoint) : false;
        return currentBreakPoint;
    }

    getTrackWidth(){
        let width = 0;
        Array.prototype.forEach.call(this.elSlides, (el, i) => {
            width += el.offsetWidth;
        });
        return width;
    }

    getMaxX(){
        return this.trackWidth - this.elWrapper.offsetWidth;
    }

    onResize(){
        if(!this.throttledResize){
            this.init();
            this.throttledResize = true;
            setTimeout(() => {
                this.throttledResize = false;
            }, 250);
        }
    }

    onTouchStart(e){
        this.touchStart = e.touches[0].pageX;
        this.prevElTrackX = this.getTrackCurrX();
    }

    onTouchMove(e){
        this.touchCurrent = e.touches[0].pageX;
        let movedX = -(this.touchStart - this.touchCurrent);
        this.moveTrack(movedX);
    }

    onTouchEnd(e){
        this.touchEnd = -(this.touchStart - this.touchCurrent);
        this.setIndexOnTouchEnd(e);
        console.log(this.index);
    }

    moveTrack(val){
        let xToApply = this.prevElTrackX + val;
        if(this.cssProp === "transform"){

            this.elTrack.style.transform = "translateX("+xToApply+"px)";
        }
        else if(this.cssProp === "position"){
            this.elTrack.style.left = xToApply+"px";
        }
        else{
            console.error("CarouselMobile : current cssProp is unknown");
        }

    }

    resetPosition(){
        this.elTrack.removeAttribute('style');
    }

    setStyles(){
        if(this.cssProp === "position"){
            this.elTrack.style.position = "relative";
        }
    }

    getTrackCurrX(){
        let x;
        switch (this.cssProp) {
            case "transform":
                x = window.getComputedStyle(this.elTrack);
                x = new WebKitCSSMatrix(x.webkitTransform).m41;
                break;
            case "position":
                x = parseFloat(this.elTrack.style.left.replace("px", "")) ? parseFloat(this.elTrack.style.left.replace("px", "")) : 0;
                break;
            default:
                console.error("CarouselMobile : current cssProp is unknown");
        }
        return x;
    }

    buildSlidesArray(){
        let arr = [];
        Array.prototype.forEach.call(this.elSlides, (el, i) => {
            arr.push({
                slide:el,
                slideWidth:el.offsetWidth
            })
        });

        return arr;
    }

    incrementIndex(){

    }

    decrementIndex(){

    }

    setIndexOnTouchEnd(e){
        let indexX = 0;
        let currElTrackX = -(this.getTrackCurrX());
        this.slides.forEach((item, i) => {
            if(indexX < currElTrackX){
                indexX += item.slideWidth;
                this.index = i;
            }
        });
    }

}
