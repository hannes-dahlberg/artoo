import $ from '$';
import Vue from 'vue';

//Put focus on on input after it has been rendered
Vue.directive('input-focus', (el, value) => {
    if (value) { el.focus(); }
})

//Use to initiate bootstrap tooltip on element
Vue.directive('tooltip', (el, binding) => {
    $(el).tooltip(binding.value);
})

Vue.directive('parallax', (el, binding) => {
    if(!binding.value) { return }
    this.scrollEvent = $(window).scroll((e) => {
        $(el).css('background-position-y',  ($(window).scrollTop() - $(el).offset().top) * binding.value.speed);
    })
})

Vue.directive('navbar-fold', {
    bind(el, binding) {
        $(el).addClass('navbar-fold');
        let threshold = binding.value && binding.value.threshold != undefined ? binding.value.threshold : 50;

        let setClass = () => {
            if($(window).scrollTop() > threshold) {
                $(el).removeClass('navbar-unfolded');
                $(el).addClass('navbar-folded');
            } else {
                $(el).removeClass('navbar-folded');
                $(el).addClass('navbar-unfolded');
            }
        };

        setClass();

        el.scrollEvent = $(window).scroll((e) => {
            setClass();
        });
    }
})