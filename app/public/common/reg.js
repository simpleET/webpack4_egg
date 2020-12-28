var reg = {
    init() {
        var $btnGetCode = $(".btn-get-code");
        this.formatMobile();

        //造成二次提交
        $(".loginBtn").off().on("click", function () {
            $(this).closest("form").submit();
        });

        // enter键提交表单
        $('#reg_form').on('keyup', function (evt) {
            if (evt.keyCode === 13) {
                $('#reg_form').submit();
            }
        });

        // 获取短信验证码
        $btnGetCode.off().click(function () {
            if ($btnGetCode.hasClass('disabled')) {
                return false;
            }
            var $mobile = $('#mobile');
            if (!$mobile.valid()) {
                return false;
            }
            $btnGetCode.addClass('disabled').text('获取中...');

            function countdown() {
                var i = 60;

                function update() {
                    $btnGetCode.text(i + 'S');
                    i--;
                    if (i >= 0) {
                        setTimeout(update, 1000);
                    } else {
                        $btnGetCode.text('重新获取').removeClass('disabled');
                    }
                }

                $btnGetCode.text('动态码已发送');
                setTimeout(update, 1000);
            }

            let obj = {
                data: {
                    mobile: $.trim($mobile.val()),
                    isCheckAccount: false
                },
                done(data) {
                    countdown();
                },
                doneOtherCode(res) {
                    $btnGetCode.text('获取动态码').removeClass('disabled');
                    $.jBox.error(res.msg, "提示");
                },
                error() {
                    $btnGetCode.text('获取动态码').removeClass('disabled');
                    $.jBox.error('服务器繁忙', "提示");
                }
            };
            common.fetch('/verify/dynamic/login', obj, 'get');
        });

        // 动态码  登录||注册
        $('#reg_form').validate({
            ignore: ".ignore:hidden,.ignore",
            rules: {
                mobile: {required: true, isMobile: true},
                dynamicCode: {required: true, isCaptcha: true},
            },
            messages: {
                mobile: {required: "手机号不能为空", isMobile: "手机号格式不正确"},
                dynamicCode: {required: '短信验证码不能为空', isCaptcha: "请输入正确的短信验证码!"},
            },
            errorPlacement: function (error, element) {
                element.closest(".form-item").append(error);
                if (element.is('[name=mobile]')) {
                    element.siblings('input[type=text]').addClass('error')
                }
            },
            success: function (label) {
                label.remove();
                return true;
            },

            submitHandler: function (form) {
                var $loginBtn = $(form).find(".btn-submit");

                if ($loginBtn.prop('disabled')) return;
                $loginBtn.prop('disabled', true).text("登录中...");

                let obj = {
                    data: JSON.stringify({
                        mobile: $.trim($("#mobile").val()),
                        dynamicCode: $("#dynamic_code").val(),
                        loginType: 'dynamic',
                        loginWay: 'pc',
                        isAutoRegister: 1,
                        isAutoRegain: $("#isAutoRegain").val(), // 是否认领账号。0为不认领，1为认领。
                    }),
                    contentType: 'application/json; charset=UTF-8', // Request Payload 数据格式解决方案:JSON.stringify() && JSON.stringify()
                    done(res) {
                        loginPw.done(res, true);
                        header.checkLogin();
                    },
                    doneOtherCode(res) {
                        $loginBtn.prop('disabled', false).text("求职注册/登录");

                        if (res.fail) {
                            var mobile = res.data.regainAccountInfo.mobile;
                            var age = res.data.regainAccountInfo.age;
                            var gender = res.data.regainAccountInfo.gender;
                            var comName = res.data.regainAccountInfo.workInfo.comName;

                            mobile = `${mobile.substring(0, 3)}****${mobile.substring(7,)}`;

                            var temp = '';
                            for (var i = 0; i < res.data.regainAccountInfo.name.length - 1; i++) {
                                temp += '*';
                            }
                            var name = res.data.regainAccountInfo.name.substring(0, 1) + temp;

                            // 账号认领弹窗
                            var html = ` 
                                        <div class="claim-box">
                                            <p>手机${mobile} 已有一份简历，请核对信息所属。</p>
                                            <p>${name} ${gender == 1 ? '先生' : '小姐'}&#12288;&#12288;${age}岁</p>
                                            <p>曾就职于：${comName}</p>
                                            <div class="btn-box">
                                                <a class="btn-claim active disabled ">认领并登录（<span id="js_times">5</span>s）</a>
                                                <a class="btn-submit">注册新简历</a>
                                            </div>
                                        </div>
                                    `;
                            $.jBox(html, {
                                title: '旧账号简历认领',
                                width: 430,
                                buttons: {},
                                loaded: function () {
                                    var $claimBox = $('.claim-box');
                                    var $obj = $claimBox.find("#js_times");

                                    common.fn.loadSecond($obj, 5, function () {
                                        $obj.parent('a').removeClass('disabled').html('认领并登录');
                                    });


                                    $claimBox.find('.btn-claim').click(function () {
                                        if ($(this).is('.disabled')) return;

                                        $("#isAutoRegain").val(1);
                                        $('#reg_form').submit();
                                        $.jBox.close();
                                    });
                                    $claimBox.find('.btn-submit').click(function () {
                                        $("#isAutoRegain").val(0);
                                        $('#reg_form').submit();
                                        $.jBox.close();
                                    });
                                }
                            });

                        } else {
                            $.jBox.error(res.msg || "当前网络不可用，请检查您的网络设置。", "提示");
                            $("#dynamic_code").val('')//.focus().blur(); // 使label 标签显示
                        }

                    },
                    error() {
                        $.jBox.error("请求超时，请稍后再试！", "提示");
                        $loginBtn.prop('disabled', false).text("求职注册/登录");
                    }
                };

                common.fetch('/session/per/dynamic', obj, 'post');
            }
        });
    },
    // 手机格式化
    formatMobile() {
        var $mobileShow = $(".mobileShow");
        var $mobile = $("#mobile");
        var $getIdCode = $(".btn-get-code");

        $mobileShow.keypress(function (e) {
            if (e.keyCode != 8) {
                var $this = $(this);
                var val = $this.val();

                if (val.length == 3 || val.length == 8) {
                    $this.val(val + '-');
                }
            }
        }).keyup(function () {
            $mobile.val($(this).val().replace(/-/g, ''));
            if ($mobile.valid()) {
                $getIdCode.removeClass("disabled");
            } else {
                $getIdCode.addClass("disabled");
            }
        });
    },
};
export default reg
