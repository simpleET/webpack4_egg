import Cookies from 'js-cookie';
import '../common/common';
import '../scss/index.scss'
import Swiper from '../plugin/swiper/idangerous.swiper'

var index = {
    init: function () {
        var _this = this;

        _this.eventHandler();
        _this.swiper();
        _this.banner();
        _this.nav_bar();
        _this.logPerBehavWeb();

    },
    // 事件处理
    eventHandler: function () {
        var _this = this;

        // 切换 tab
        $('.tab-bar.is-tab').on('click', '[data-tab]', function () {
            var $this = $(this);

            if ($this.is('.active')) return;

            $this.addClass('active').siblings('[data-tab]').removeClass('active');
            var $tabItem = $this.parents('.tab-bar').siblings('.tab-content').children('[data-tab=' + $this.data('tab') + ']');
            $tabItem.show().siblings().hide();
        });

        // 帮投
        var html_bangtou = `
                <div id="bangtou-madal">
                    <div class="table">
                        <div class="table-cell">
                            <div class="modal-content">
                                <i class="btn-close">&times;</i>
                                <img src="/public/images/per_qrcode_app.png">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        $(".bangtou-com-list li,.btn-see-more.btn-bangtou").click(function () {
            var $modal = $('#bangtou-madal');
            if ($modal.length) {
                $modal.fadeIn('fast');
            } else {
                $('body').append(html_bangtou);
                $modal = $('#bangtou-madal').fadeIn('fast');
            }
            $modal.on('click', '.btn-close', function () {
                $modal.fadeOut('fast');
            })
        });



        //  关闭广告图
        $('.top-cont .btn-close').click(function (e) {
            e.preventDefault();
            $('.top-cont').slideUp('fast');
        });

        //  显示行业
        $(".industry-header").hover(function () {
            $($(this).data('id')).show();
        }, function () {
            $($(this).data('id')).hide();
        });

        $(".industry-detail-cont").hover(function () {
            $(this).show();
            $('[data-id=#' + $(this).attr('id') + ']').addClass('active');
        }, function () {
            $(this).hide();
            $('[data-id=#' + $(this).attr('id') + ']').removeClass('active');
        });


    },
    // 悬浮导航栏
    nav_bar: function () {
        var $anchor = $("#anchor-float");
        var $navWrap = $(".nav-wrap");
        var $navCont = $(".nav-cont");
        var $searchCont = $('.search-content');
        var $navRigthContent = $('.nav-right-content');
        var $btnChangeNavCont = $(".btn-change-nav-cont");
        var $hrHelperEntrance = $('.Hr_helper_entrance');

        $(window).on('load scroll resize', function () {
            // 悬浮
            if ($(document).scrollTop() >= $anchor.offset().top + 86) {
                if (!$navWrap.hasClass('fixed')) {
                    $navCont.hide();
                    $navWrap.addClass('fixed');

                    $navCont.slideDown('fast');
                    $navRigthContent.hide();
                    $hrHelperEntrance.hide();
                }
            } else {
                if ($navWrap.hasClass('fixed')) {
                    $btnChangeNavCont.removeClass('is-nav');
                    $navWrap.removeClass('fixed');
                    $navCont.show();
                    $searchCont.show();
                    $navRigthContent.show();
                    if($hrHelperEntrance.hasClass('active')){
                        $hrHelperEntrance.show();
                    }
                }
            }
        });

        $btnChangeNavCont.click(function () {
            var $this = $(this);

            if ($this.hasClass('is-nav')) {
                $this.removeClass('is-nav');
                // $searchCont.removeClass('hidden');
                // $navRigthContent.addClass('hidden');
                $searchCont.fadeIn('fast');
                $navRigthContent.hide();
            } else {
                $this.addClass('is-nav');
                // $searchCont.addClass('hidden');
                // $navRigthContent.removeClass('hidden');
                $searchCont.hide();
                $navRigthContent.fadeIn('fast');
            }
        });

    },
    // 轮播图--闪光企业
    swiper: function () {
        if ($(".flicker-cont .swiper-slide").length == 1) {
            $(".change_page").remove();
            return;
        }

        var mySwiper = new Swiper('.flicker-cont .swiper-container', {
            autoplay: 5000,
            loop: true,
            pagination: '.pagination2',
            paginationClickable: true,
            onSlideChangeStart: function (swiper) {
                // console.log(swiper.activeLoopIndex+1)
                $(".activeIndex").text(swiper.activeLoopIndex + 1);

                //swiper3.0版本以上自带lazyload,此处使用jquery.lazyload.js无效,
                $(".swiper-slide-active img.lazy").each(function (i, dom) {
                    $(dom).attr("src", $(dom).data('original'));
                })

            },
            onInit: function (swiper) {
                // console.log(swiper)
                /* $(".activeIndex").text(swiper.activeLoopIndex + 1);
                 $(".slide_length").text(swiper.slides.length - 2)
                 var timer = null;
                 $(".swiper-button-prev").click(function () {
                     mySwiper.swipePrev();
                     clearTimeout(timer);
                     timer = setTimeout(mySwiper.startAutoplay, 1000);
                     clearTimeout(timer);
                     timer = setTimeout(mySwiper.startAutoplay, 1000);
                 });
                 $(".swiper-button-next").click(function () {
                     mySwiper.swipeNext();
                 });
                 $(".swiper-container").on("mouseenter", function () {
                     mySwiper.stopAutoplay();
                 });
                 $(".swiper-container").on("mouseleave", function () {
                     mySwiper.startAutoplay();
                 });*/
            }
        });
    },
    // 轮播图--广告图
    banner: function () {
        var $banner = $(".banner-cont");
        var href = "";
        var $btn_switch_left = $(".btn-switch_left");
        var $btn_switch_right = $(".btn-switch_right");
        console.log('3333')

        var bannerSwiper = new Swiper('.banner-cont .swiper-container', {
            autoplay: 5000,
            // mode: 'vertical',
            loop: true,
            pagination: '.pagination',
            paginationClickable: true,
            onSlideChangeStart: function (swiper) {
                // 处理懒加载
            },
            onInit: function (swiper) {
                $btn_switch_left.click(function () {
                    bannerSwiper.swipePrev();
                });
                $btn_switch_right.click(function () {
                    bannerSwiper.swipeNext();
                })
            }
        });
    },
    //埋点
    logPerBehavWeb: function () {
        var _this = this;

        $(".flicker-cont").on("click", "a[data-log]", function () {
            logPerBehavWeb("index:click:blinkCom:Pos", $(this).attr("href"), $(this).data("log"));
            if($(this).is('.comName')){
                $.get("/logo/"+$(this).data("logo"));
            }
        });

    },
};

index.init();
