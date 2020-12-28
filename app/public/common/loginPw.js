var loginPw = {
  init: function($loginForm, callback) {
    var _this = this;

  },
  // 登录--公共的验证
  defaultValidator: {
    ignore: '.ignore:hidden,.ignore',
    rules: {
      userAccount: { required: true, maxlength: 50 },
      userPassword: { required: true, unBlank: true, rangelength: [6, 20] },
      captcha: { required: true, isImgCaptcha: true }
    },
    messages: {
      userAccount: { required: '账号不能为空', maxlength: '用户名长度超过{0}位!' },
      userPassword: { required: '密码不能为空', rangelength: '新密码长度需在6-20字符之间' },
      captcha: { required: '验证码不能为空', isImgCaptcha: '验证码错误或已过期' }
    },
    errorPlacement: function(error, element) {
      element.closest('.form-item')
        .append(error);
    },
    success: function(label) {
      label.remove();
      return true;
    }
  },
  // 登录成功后：只处理简历状态。如果要处理个人信息： header.checkLogin();// 填充个人信息到页面
  done: function(res, isMobile) {
    let _this = this;

    Cookies.set('per', res.data.token, {
      domain: 'job5156.com'
    });

    if (isMobile) {
      _this.goto(res);
    } else {
      if (res.data.isMobileActivated) {
        let redirect = $('#ref')
          .val();

        // 登录页才有redirect
        if (redirect) {
          if (redirect === '/') {
            _this.goto(res);
          } else {
            location.href = redirect;
          }
        }
        // 登录弹窗|| 登录模块
        else {
          _this.goto(res);
        }
      } else {
        common.fn.verifyPhone(res.data.mobile, true);
      }
    }
  },
  goto(res) {
    // 未填写简历
    if (!res.data.isBasicComplete) {
      location.href = '/per/new/step1';
      return false;
    }

    if (res.data.pass === 0 || !res.data.isIntentInComplete || !res.data.isWorkComplete || !res.data.isEducationComplete) {
      // 简历未完善
      location.href = '/per/resume/';
    }
    // 简历完善
    else {
      // 登录弹窗
      if ($('#perLoginModal').length) {
        $.jBox.close('perLoginModal');
      }
      // 登录页面||注册合并页面
      else if (location.pathname === 'login/per' || location.pathname === '/register/per') {
        location.href = '/';
      }
      /* // 登录插入模块--也不做刷新页面了
       else {
           location.reload();
       }*/
    }
  },
  // 第三方登录
  thirdLogin() {
    $('body')
      .on('click', '.third_box [data-type]', function() {
        var type = $(this)
          .data('type');
        let obj = {
          done(res) {
            window.location.href = res.url;
          },
          doneOtherCode() {
            $.jBox.tip(res.msg, 'error');
          }
        };
        common.fetch(`/connect/login/${type}`, obj, 'get');
      });
  },
};
export default loginPw;
