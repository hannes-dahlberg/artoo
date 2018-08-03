"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var vue_1 = require("vue");
vue_1.default.directive('input-focus', function (el, value) {
    if (value) {
        el.focus();
    }
});
vue_1.default.directive('tooltip', function (el, binding) {
    $(el).tooltip(binding.value);
});
vue_1.default.directive('parallax', function (el, binding) {
    if (!binding.value) {
        return;
    }
    _this.scrollEvent = $(window).scroll(function () {
        $(el).css('background-position-y', ($(window).scrollTop() - $(el).offset().top) * binding.value.speed);
    });
});
vue_1.default.directive('navbar-fold', {
    bind: function (el, binding) {
        $(el).addClass('navbar-fold');
        var threshold = binding.value && binding.value.threshold != undefined ? binding.value.threshold : 50;
        var setClass = function () {
            if ($(window).scrollTop() > threshold) {
                $(el).removeClass('navbar-unfolded');
                $(el).addClass('navbar-folded');
            }
            else {
                $(el).removeClass('navbar-folded');
                $(el).addClass('navbar-unfolded');
            }
        };
        setClass();
        el.scrollEvent = $(window).scroll(function () {
            setClass();
        });
    }
});
