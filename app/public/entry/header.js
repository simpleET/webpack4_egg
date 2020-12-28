import common from '../common/common';
import loginPw from '../common/loginPw';
import Reg from '../common/reg';

var header = {
  init: function() {
    var _this = this;
    console.log('2333')
    _this.login_form.init();
    _this.searchBar();
    _this.sidebar.init();
    _this.checkLogin();
    _this.logOut();
    _this.otherEvent();
    _this.city_site();
    loginPw.thirdLogin();// 第三方登录
    _this.Hr_helper_entrance(); //  HR助手
    _this.searchBox.init(); // 搜索联想
  },
  otherEvent: function() {
    var _this = this;
    var $jobState = $('.job-state');

    // 求职状态
    $jobState.hover(function() {
      $jobState.addClass('active')
        .children('.dropdown-menu')
        .show();
    }, function() {
      $jobState.removeClass('active')
        .children('.dropdown-menu')
        .hide();
    })
      .on('click', 'li', function() {
        var $this = $(this);

        if ($jobState.data('load')) {
          $jobState.data('load', false);
          changeView();
        } else {
          // 设置求职状态
          var obj = {
            data: {
              jobState: $this.data('val')
            },
            done(res) {
              changeView();
              $.jBox.tip('修改成功！', 'success');
            },
            doneOtherCode(res) {
              $.jBox.error('修改失败！请稍后重试', '提示');
            }
          };
          common.fetch('/per/jobState', obj, 'put');
        }

        function changeView() {
          $this.addClass('active')
            .siblings('li')
            .removeClass('active');
          $jobState.children('.text')
            .text($this.text());
          $jobState.children('.dropdown-menu')
            .hide();
        }
      });

    $('body')
      .on('click', '.img-captcha', function() {
        var src = $(this)
          .attr('src')
          .split('?')[0] + '?t=' + new Date().getTime();
        $(this)
          .attr('src', src)
          .siblings('input[type=text]')
          .val('');
      })
      .on('click', '.isSeePw', function() {
        var $pwInput = $(this)
          .siblings('input');
        if ($(this)
          .is('.canSee')) {
          $(this)
            .removeClass('canSee');
          if ($pwInput.attr('type') == 'text') {
            $pwInput.attr('type', 'password');
          }
        } else {
          $(this)
            .addClass('canSee');
          if ($pwInput.attr('type') == 'password') {
            $pwInput.attr('type', 'text');
          }
        }
      });

    $('.login-per-dialog')
      .on('click', function() {
        common.perLoginModal(function() {

        },);
      });


    // 应聘职位
    $(document.body)
      .on('click', '.btn-apply', function() {
        var $this = $(this);
        var id = $this.attr('data-id');
        if ($this.hasClass('disabled')) return;

        common.per.apply(id, function(res) {
          $this.text('已投递')
            .addClass('disabled');
        }, 'pc_index');
      });

  },
  // 登出
  logOut: function() {
    $('#logout')
      .on('click', function() {
        var obj = {
          done() {
            Cookies.remove('per');
            window.location.reload();
          },
          doneOtherCode() {
            $.jBox.error(data.msg, '提示');
          },
          error() {
            $.jBox.error('请求超时，请稍后再试！', '提示');
          }
        };
        common.fetch('/session/per', obj, 'delete');
      });
  },
  // 弹窗登录（不刷新页面）也会调用该方法，
  checkLogin: function() {
    var _this = this;

    common.checkLogin(function(res) {
      if (res.code === 200) {
        window.isLogin = true;
        var $userMsgBox = $('.user-msg-box');

        $('.btn-login-reg')
          .remove();
        $('#user_msg')
          .removeClass('hidden');
        $('.user-name')
          .removeClass('hidden')
          .text(res.data.perUserName || res.data.mobile);
        $userMsgBox.find('.caret-bottom')
          .removeClass('hidden');

        $('.left-box')
          .find('.mask-layer')
          .remove();

        _this.getNoticeAmount();
        _this.getResumeList();

        // 插入数据再显示
        $('.user-msg-cont')
          .fadeIn('slow');//.removeClass('hidden');
        $('.login-cont')
          .remove();
      } else {
        $('.login-cont')
          .fadeIn('slow');
      }

    });
  },
  // 消息数量 - 未读统计
  getNoticeAmount: function() {
    var obj = {
      done(res) {
        if (!res.data) return;

        if (res.data.inviteUnreadCount) {
          $('.interview-numbs')
            .text(res.data.inviteUnreadCount);
        } else {
          $('.interview-numbs')
            .remove();
        }

        if (res.data.viewUnreadCount) {
          $('.check-numbs')
            .text(res.data.viewUnreadCount);
        } else {
          $('.check-numbs')
            .remove();
        }

        if (res.data.msgUnreadCount) {
          $('.letter-numbs')
            .text(res.data.msgUnreadCount);
        } else {
          $('.letter-numbs')
            .remove();
        }
      },
    };
    common.fetch('/per/noticeAmount', obj, 'get');
  },
  // 简历 - 获取列表
  getResumeList() {
    var _this = this;
    var obj = {
      done(res) {
        _this.getResume(res.data.defaultId);
      }
    };
    common.fetch('/per/resume', obj, 'get');
  },
  // 获取完整简历信息
  getResume: function(resumeId) {
    var obj = {
      done(res) {
        var freshness = res.data.resumeDetail.freshness; // 简历新鲜度
        var perfectNum = Math.round(res.data.resumeDetail.perfectNum); // 简历完整度数
        var gender = res.data.resumeDetail.basicInfoVo.gender;
        var imgSrc = res.data.resumeDetail.basicInfoVo.photoUrl;
        var jobState = res.data.resumeDetail.basicInfoVo.jobState;

        if (!imgSrc) {
          imgSrc = `http://my.job5156.com/public/images/${gender === 1 ? 'boy' : 'girl'}.jpg`;
        }

        if (gender === 1) {
          $('.iconnan')
            .show()
            .siblings('.iconnv')
            .hide();
        } else {
          $('.iconnv')
            .show()
            .siblings('.iconnan')
            .hide();
        }

        $('.res-freshness')
          .text(freshness * 100);
        $('.res-freshness-bar')
          .width(freshness * 100 + '%');
        $('.res-perfectNum')
          .text(perfectNum);
        $('.res-perfectNum-bar')
          .width(perfectNum + '%');

        $('.user-photo img')
          .attr('src', imgSrc);

        $('.job-state')
          .data('load', true);
        $('.job-state .dropdown-menu [data-val=' + jobState + ']')
          .click();
      }
    };
    common.fetch(`/per/resume/${resumeId}`, obj, 'get');
  },
  // 注册表单
  login_form: {
    init: function() {
      var _this = this;
      var flag = 0;
      var $loginForm = $('#login_form');

      //IE下去除眼睛
      if (common.isIE()) {
        $('.isSeePw')
          .remove();
      }
      //  显示app 下载广告图
      $('.btn-download-app').click(function() {
          var $pic_app_download = $('.pic-app-download');
          var top = 0;
          var $this = $(this);

          if ($this.hasClass('close')) {
            top = '-100%';
          } else {
            top = '0';
            $pic_app_download.show();
          }

          $pic_app_download.children('div')
            .animate({
              top: top,
            }, 'fast', function() {
              if ($this.hasClass('close')) {
                $pic_app_download.hide();
              }
            });
        });

      // 切换表单
      $('.btn-change-form a').click(function() {
          var left = 0;

          if (flag % 2 == 0) {
            left = $('#reg_form')
              .outerWidth();
            $('#reg_form')
              .removeClass('active')
              .siblings('form')
              .addClass('active');
          } else {
            left = 0;
            $('#reg_form')
              .addClass('active')
              .siblings('form')
              .removeClass('active');
          }

          flag++;
          $('.login-form-content')
            .animate({
              left: -left,
            }, 'fast',);
        });

      // 提交表单
      $('.btn-submit')
        .click(function() {
          $(this)
            .closest('form')
            .submit();
        });
      // enter键提交表单
      $('#reg_form,#login_form')
        .on('keyup', function(evt) {
          if (evt.keyCode === 13) {
            $(this)
              .submit();
          }
        });

      Reg.init();// 注册模块

      // 账号密码登录
      $loginForm.validate($.extend({
        submitHandler: function(form) {
          var $loginBtn = $(form)
            .find('.btn-submit');

          if ($loginBtn.hasClass('disabled')) return;
          $loginBtn.addClass('disabled')
            .text('登录中...');

          let obj = {
            data: JSON.stringify({
              userAccount: $.trim($loginForm.find('#user_account')
                .val()),
              userPassword: $loginForm.find('#user_password')
                .val(),
              loginType: 'web',
              loginWay: 'pc',
              captcha: $loginForm.find('#img_captcha')
                .val()
            }),
            contentType: 'application/json; charset=UTF-8',
            done(res) {
              loginPw.done(res, false);
              header.checkLogin();// 填充个人信息到页面
            },
            doneOtherCode(res) {
              $loginBtn.removeClass('disabled')
                .text('登录');
              if (!res.data.showCaptcha) {
                $.jBox.error(res.msg, '提示');
                $loginForm.find('#img_captcha')
                  .val('');
              } else {
                $.jBox.tip(res.msg, 'error');
                var html = `
                                                <div class="form-item img-captcha-item2">
                                                    <img class="img-captcha" src="${$('#eyasApi')
                  .val()}/verify/image?t=${new Date().getTime()}" title="看不清？换一个">
                                                    <input type="text" placeholder="请输入图片验证码">
                                                    <label class="error" style="display: none">图片验证码不能为空</label>
                                                </div>
                                            `;
                $.jBox(html, {
                  id: 'img_captcha_modal',
                  title: '图片验证码',
                  height: '100',
                  buttons: { '取消': 'cancel', '确定': 'ok' },
                  submit: function(v) {
                    var $imgCaptchaItem = $('#img_captcha_modal')
                      .find('.img-captcha-item2');
                    var val = $imgCaptchaItem.find('input[type=text]')
                      .val();

                    if (v === 'ok') {
                      if (!val) {
                        $imgCaptchaItem.children('label')
                          .text('图片验证码不能为空')
                          .show();
                        return false;
                      }
                      $loginForm.find('#img_captcha')
                        .val(val);
                      $loginForm.submit();
                    }
                  },
                  loaded: function() {
                    var $imgCaptchaItem = $('#img_captcha_modal')
                      .find('.img-captcha-item2');
                    var reg = /^[0-9a-zA-Z]{4}$/;
                    $imgCaptchaItem.find('input[type=text]')
                      .on('input propertychange change', function() {
                        if (!$(this)
                          .val()) {
                          $imgCaptchaItem.children('label')
                            .text('图片验证码不能为空')
                            .show();
                        } else if (!reg.test($(this)
                          .val())) {
                          $imgCaptchaItem.children('label')
                            .text('验证码错误或已过期')
                            .show();
                        } else {
                          $imgCaptchaItem.children('label')
                            .text('')
                            .hide();
                        }
                      });
                  }
                });
              }
            },
            error() {
              $.jBox.error('请求超时，请稍后再试！', '提示');
              $loginBtn.addClass('disabled')
                .val('登录');
            }
          };
          common.fetch('/session/per/account', obj, 'post');
        }
      }, loginPw.defaultValidator));
    },
  },
  searchBar: function() {
    //搜索条处理
    var $searchForm = $('#searchForm');

    if ($searchForm.length == 0) return;

    //职位工作地点
    var $cityNames = $searchForm.find('[name="searchCityName"]');


    common.fn.searchHandle.btnSearch($searchForm, 'pos');
    $('#key_type_sel')
      .selDropDown({
        type: null,
        data: [{ id: 0, name: '全文' }, { id: 1, name: '职位' }, { id: 2, name: '公司' }],
        defValue: 0
      });

    $('.key_type_list')
      .on('click', 'li', function() {
        $(this)
          .addClass('selected')
          .siblings('li')
          .removeClass('selected');
        $('#keyTypeName')
          .val($(this)
            .data('value'));
      });

    $('#btn_searchCity')
      .localitiesSelector({
        color: '#f6ab00',
        selectType: 'checkbox',
        selectParent: true,
        maskModal: false,
        closed: function() {
          $('#btn_searchCity')
            .attr('title', $cityNames.val());
        }
      });
  },
  //搜索联想
  searchBox: {
    timer: null,
    timeOut: 200,
    init: function() {
      var _this = this;
      var pageName = $('#page_name')
        .val() || '';
      var kw = '';
      var $search_tip_cont = $('.search_tip_cont');
      var $input = $('#keyword');


      if (pageName && !(pageName == 'index' || pageName == 'search' || pageName == 'school')) {
        return;
      }

      $input.off()
        .on('input propertychange click', function() {
          //IE 浏览器改变placeholder会触发input事件
          if (!$(this)
            .is(':focus')) {
            return;
          }
          kw = $.trim($(this)
            .val());

          clearTimeout(_this.timer);
          _this.timer = setTimeout(function() {
            _this.loadSearchTip(kw);
          }, _this.timeOut);
        })
        .keydown(function(e) {
          if ($search_tip_cont.is(':visible') && (e.keyCode === 38 || e.keyCode === 40)) {
            _this.arrow(e);//上下移动函数

            if (!common.isIE(8)) {
              $input.val($('.search_tip_content>li.keyHover')
                .html());
            }
            //对IE8做处理
            else {
              $input.unbind('propertychange')
                .val($('.search_tip_content>li.keyHover')
                  .html())
                .bind('propertychange', function() {
                  var kw = $.trim($(this)
                    .val());
                  clearTimeout(_this.timer);
                  _this.timer = setTimeout(function() {
                    _this.loadSearchTip(kw);
                  }, _this.timeOut);
                });
            }
          }

          if (e.keyCode == 13) {
            //埋点
            var kwType = $('.search_tip_content .keyHover')
              .data('kwtype') ? $('.search_tip_content .keyHover')
              .data('kwtype') : '1';

            logPerBehavWeb('search:pos:keywordInput', $('#searchForm')
              .attr('action'), {
              keyword: $('#keyword')
                .val(),
              keywordFromSource: kwType
            });
          }
        });

      $search_tip_cont.on('click', 'li', function() {
        var $this = $(this);

        $this.addClass('hover');//用于埋点
        $('#keyword')
          .val($this.html());
        $search_tip_cont.hide();
        $('[data-st]')
          .click(); //点击搜索按钮
      });
      //点击除了搜索框之外的地方会关闭联想框和结果框
      $(document.body)
        .on('click', function(e) {
          e = e || event;
          var target = e.srcElement ? e.srcElement : e.target;
          var $target = $(target);

          if ($target.is('.search_tip_cont,#keyword')) return;
          if ($search_tip_cont.is(':visible')) {
            $search_tip_cont.hide();
          }
        });
    },
    loadSearchTip: function(kw) {
      var obj = {
        data: { 'word': kw },
        done(res) {
          var data = res.data;
          var $search_tip_cont = $('.search_tip_cont');

          if (!data) return;
          if (!data.hotWords && !data.historyWords) {
            if ($search_tip_cont.is(':visible')) {
              $search_tip_cont.hide();
            }
            return;
          }
          data.isLogin = data.isLogin ? data.isLogin : window.isLogin;
          var html = '';
          var navText = '';
          var needData = '';
          var kwType = '';//类型

          if (kw) {
            navText = '猜你想要';
            if (data.isLogin) {
              var arr2 = data.historyWords ? data.historyWords.slice(0, 2) : [];
              var arr8 = data.hotWords ? data.hotWords.slice(0, 8) : [];
              needData = arr2.concat(arr8);
            } else {
              needData = data.hotWords;
            }
            kwType = '2';
          } else if (data.isLogin) {
            navText = '搜索历史';
            needData = data.historyWords;
            kwType = '3';
          } else {
            navText = '热门职位';
            needData = data.hotWords;
            kwType = '4';
          }

          if (!$.isArray(needData) || needData.length == 0) {
            $search_tip_cont.hide();
            return;
          } else {
            $.each(needData, function(i, v) {
              //不能超过10个
              if (i > 9) {
                return;
              }
              html += '<li data-kwtype=\'' + kwType + '\'>' + v + '</li>';
            });
            $('.search_tip_content')
              .html(html);
            $('.nav_word')
              .html(navText);
            $search_tip_cont.show();
          }
        }
      };
      common.fetch('/pos/associate', obj, 'get');

    },
    //上下箭头函数
    arrow: function(e) {
      var keyHover = $('.search_tip_content>li.keyHover');
      //第一次按上下箭头
      if (keyHover.length == 0) {
        if (e.keyCode === 38) {
          //keyHover
          $('.search_tip_content>li:last')
            .addClass('keyHover');
        }
        if (e.keyCode === 40) {
          $('.search_tip_content>li:first')
            .addClass('keyHover');
        }
      }//已经按过上下箭头了
      else {
        //如果只有一个提示
        if ($('.search_tip_content>li').length == 1) {
          $('.search_tip_content>li:first')
            .addClass('keyHover');
        }//两个提示以上
        else {
          if (e.keyCode === 38) {
            //已经是第一个了，则跳到最后一个
            if (keyHover.index() == 0) {
              $('.search_tip_content>li:last')
                .addClass('keyHover')
                .siblings('li')
                .removeClass('keyHover');
            }//已经是最后一个
            else {
              keyHover.prev('li')
                .addClass('keyHover')
                .siblings('li')
                .removeClass('keyHover');
            }
          }
          if (e.keyCode === 40) {
            //已经是第一个了，则跳到最后一个
            if (keyHover.index() == ($('.search_tip_content>li').length - 1)) {
              $('.search_tip_content>li:first')
                .addClass('keyHover')
                .siblings('li')
                .removeClass('keyHover');
            } else {
              keyHover.next('li')
                .addClass('keyHover')
                .siblings('li')
                .removeClass('keyHover');
            }
          }
        }
      }
    }
  },
  // 右侧边栏
  sidebar: {
    init: function() {
      var _this = this;

      _this.toTop();
      _this.kefu_consult();

      $('.feedback')
        .on('click', function() {
          common.fn.feedbackPop();
        });
    },
    toTop: function() {
      var _this = this;
      var timer = null;
      var isSysScroll = true;

      $(window)
        .scroll(function() {
          //用户滚动
          if (!isSysScroll) {
            clearInterval(timer);
          }
          isSysScroll = false;
        });

      $('.to-top')
        .on('click', function() {
          clearInterval(timer);
          timer = setInterval(function() {
            var scrollTop = $(document)
              .scrollTop();
            var speed = Math.floor(-scrollTop / 8);

            if (scrollTop == 0) clearInterval(timer);

            $(document)
              .scrollTop(scrollTop + speed);
            isSysScroll = true;
          }, 1000 / 60);
        });
    },
    kefu_consult: function() {
      $('.box-53kf')
        .click(function() {
          window.open('https://tb.53kf.com/code/client/9007928/1', 'kefu', 'height=600, width=800, toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, status=no');
        });
    }
  },
  // 城市分站点弹窗
  city_site: function() {

    common.getDictionary('dictionary/site', 'citySite', function(data) {
      if (!data) return;

      var cityEn = $('#cityEn')
        .val();
      var cityName = '全国';
      var html = ` <li><a href="/" class="${!cityEn ? 'select' : ''}" title="全国">全国</a></li>`;

      $.each(data, function(i, item) {
        html += `<li><a href="/${item.en}/" class="${cityEn == 'item.en' ? 'select' : ''}" title="${item.name}">${item.name}</a></li>`;
        if (cityEn && cityEn == 'item.en') {
          cityName = item.name;
        }
      });

      var citySite = `
                    <div class="city_site_cont">
                        <div class="city_site_box">
                            <div class="header">
                                切换城市
                                <i class="icon-close_btn_02" id="close_city_site"></i>
                            </div>
                            <div class="city_site_content">
                                <p class="intro">亲爱的用户您好：<br>切换城市分站，让我们为您提供更准确的职位信息。</p>
                                <p class="now_site"><i class="icon-address_icon_02"></i>&nbsp;当前定位：<span>${cityName}</span>，或者切换到以下站点
                                </p>
                                 <ul class="city_site_list">${html}</ul>
                            </div>
                        </div>
                    </div>
                `;
      $('body')
        .append(citySite);

      var $city_site_cont = $('.city_site_cont');

      $('.btn-show-site')
        .click(function() {
          $city_site_cont.fadeIn();
        });

      $('#close_city_site')
        .click(function() {
          $city_site_cont.fadeOut('fast');
        });
    });

  },
  // HR助手入口
  Hr_helper_entrance: function() {
    var $Hr_helper_entrance = $('.Hr_helper_entrance');

    if ($Hr_helper_entrance.length == 0) return;

    var obj = {
      done(res) {
        var data = res.data;
        if (!data.hrChatbotEnabled) {
          return;
        }
        if (!data || $.isEmptyObject(data) || data.unchattedPosNum <= 0) return;

        var html = ` <div> 
                                <img src="/public/images/icon/user_default_gril.png">
                                <div>
                                    <p>有<span class="msg_num">${data.unchattedPosNum}</span>家企业HR希望与你<a href="/per?hr=1&t=${new Date().getTime()}">面试</a></p>
                                    <i class="close_entrance">&times;</i>
                                </div>
                            </div>`;

        $Hr_helper_entrance.addClass('active')
          .html(html)
          .fadeIn(function() {
            setTimeout(function() {
              $Hr_helper_entrance.animate({ width: '70px' }, 'slow')
                .find('.close_entrance')
                .click(function() {
                  $Hr_helper_entrance.fadeOut(function() {
                    $Hr_helper_entrance.remove();
                  });
                });
            }, 1000);
          })
          .hover(function() {
            $Hr_helper_entrance.stop()
              .animate({ width: '340px' });
          }, function() {
            $Hr_helper_entrance.stop()
              .animate({ width: '70px' });
          });
      }
    };
    common.fetch('/per/hrChatbot/jobsNew', obj, 'get');
  },
};
header.init();
// export default header;
