/*
* 注册页面
* */
var CLS_DISABLED = 'disabled';
var MAX_COUNT_DOWN = 60;

//dev
var ServerAddress = "http://47.110.247.106:18080";
//prod
// var ServerAddress = "";

var Register = {
    inviteCode: null,
    smsCode: '',
    province: '',
    city: '',
    region: '',
    address: '',
    init: function () {
        this.inviteCode = Common.getUrlParam('pCode');

        if (!this.inviteCode) {
            Common.showErrorPage("未找到邀请码, 请退出重试或联系客服");
            return;
        }

        this.initLocation();

        this.setInviteCode(this.inviteCode);

        //调用监听
        this.monitor();
    },
    //设置邀请码
    setInviteCode: function(inviteCode) {
        $('#inviteCode').val(inviteCode);
    },
    //防止页面刷新倒计时失效
    /**
     * 获取验证码按钮
     */
    monitor: function() {
        var LocalDelay = this.getLocalDelay();
        if(LocalDelay.time!=null){
            var timeLine = parseInt((new Date().getTime() - LocalDelay.time) / 1000);
            if (timeLine > LocalDelay.delay) {
                console.log("过期");
                $('#send').html("获取验证码");
                $('#send').removeClass(CLS_DISABLED);
            } else {
                var _delay = LocalDelay.delay - timeLine;
                $('#send').html("重新发送("+_delay+")");
                $('#send').addClass(CLS_DISABLED);
                var timer = setInterval(function() {
                    if (_delay > 1) {
                        _delay--;
                        $('#send').html("重新发送("+_delay+")");
                        Register.setLocalDelay(_delay);
                    } else {
                        clearInterval(timer);
                        $('#send').html("获取验证码");
                        $('#send').removeClass(CLS_DISABLED);
                    }
                }, 1000);
            }
        } else {
            $('#send').html("获取验证码");
            $('#send').removeClass(CLS_DISABLED);
        }
    },
    /**
     * 验证码倒计时
     */
    countDown: function(callback) {
        if ($('#send').html() == "获取验证码") {
            var _delay = MAX_COUNT_DOWN;
            var delay = _delay;
            $('#send').html("重新发送("+_delay+")");

            $('#send').addClass(CLS_DISABLED);

            var timer = setInterval(function() {
                if (delay > 1) {
                    delay--;
                    $('#send').html("重新发送("+delay+")");
                    Register.setLocalDelay(delay);
                } else {
                    clearInterval(timer);
                    $('#send').html("获取验证码");
                    $('#send').removeClass(CLS_DISABLED);
                }
            }, 1000);

            callback && callback();
        } else {
            return false;
        }
    },
    //设置setLocalDelay
    setLocalDelay: function(delay) {
        //location.href作为页面的唯一标识，可能一个项目中会有很多页面需要获取验证码。
        sessionStorage.setItem("delay_" + location.href, delay);
        sessionStorage.setItem("time_" + location.href, new Date().getTime());
    },
    getLocalDelay: function() {
        var LocalDelay = {};
        LocalDelay.delay = sessionStorage.getItem("delay_" + location.href);
        LocalDelay.time = sessionStorage.getItem("time_" + location.href);
        return LocalDelay;
    },
    //发送验证码
    sendVerifyCode: function () {
        var login = $('#phone').val();
        if(!this.isPhoneNumValid(login)) {
            return;
        }

        this.countDown(function () {
            //调用获取验证码接口
            var login = $('#phone').val();
            if(!Register.isPhoneNumValid(login)) {
                return;
            }

            $.ajax({
                type: 'GET',
                url: ServerAddress + "/service/user/smsVerifyCode",
                data: {
                    phone: login,
                    type: "1"
                },
                dataType:"json",
                success:function(res){
                    console.log(res);
                    if(res.status != 0) {
                        Common.toast(res.msg);
                    } else {
                        Common.toast("验证码发送成功");
                    }
                },
                error:function(){
                    Common.toast("服务器异常,验证码发送失败");
                }
            });
        });
    },
    //提交注册
    onSubmit: function (evt) {
        evt.preventDefault();

        var login = $('#phone').val();
        if(!this.isPhoneNumValid(login)) {
            return;
        }

        var password = $('#password').val();
        if(!password) {
            Common.toast("请输入密码");
            return;
        }

        var verifyPassword = $('#verifyPassword').val();
        if(!verifyPassword) {
            Common.toast("请再次输入密码");
            return;
        }

        if(password != verifyPassword) {
            Common.toast("两次输入的密码不一致");
            return;
        }

        var smsCode = $('#verifyCode').val();
        if(!smsCode) {
            Common.toast("请输入验证码");
            return;
        }

        var place = $('#place').val();
        if(!place) {
            Common.toast("请输入区域");
            return;
        }

        this.street = $('#street').val();
        if(!this.street) {
            Common.toast("请输入详细地址");
            return;
        }

        var data = {
            parentCode: this.inviteCode,
            login: login,
            smsCode: smsCode,
            password: password,
            province: this.province,
            city: this.city,
            region: this.region,
            address: this.street
        };

        $.ajax({
            type: 'POST',
            url: ServerAddress + "/service/user/qrcodeRegister",
            data: data,
            dataType:"json",
            success:function(res){
                console.log(res);
                if(res.status != 0) {
                    Common.toast(res.msg);
                } else {
                    Common.toast("注册成功");
                    setTimeout(function () {
                        location.href = "https://app.xiyinshenghuo.com/index.html";
                    }, 2000);
                }
            },
            error:function(){
                Common.toast("服务器异常,注册失败");
            }
        });
    },
    //获取定位
    initLocation: function () {
        var geolocation = new BMap.Geolocation(),
            context = this;

        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                // alert('您的位置：'+r.point.lng+','+r.point.lat);
                context.getPositionByLongitudeAndLatitude(r.point.lng, r.point.lat);
            }
            else {
                Common.showErrorPage("获取定位失败, 请退出重试或联系客服");
            }
        },{enableHighAccuracy: true});
    },
    //根据经纬度获取省市区
    getPositionByLongitudeAndLatitude: function(lng, lat, callback) {
        var context = this;

        $.ajax({
            type: 'GET',
            url: ServerAddress + "/service/user/geocoder",
            data: {
                lat: lat,
                lng: lng
            },
            dataType:"json",
            success:function(res){
                console.log(res);
                if(!res || !res.data || !res.data.result || !res.data.result.addressComponent) {
                    Common.toast("获取定位地址失败");
                    return;
                }

                var addressComponent = res.data.result.addressComponent;

                context.province = addressComponent.province;
                context.city = addressComponent.city;
                context.district = addressComponent.district;
                context.street = addressComponent.street;

                $('#place').val(context.province + context.city + context.district);
                $('#street').val(context.street);

                if(!context.province) {
                    return;
                }

                callback && callback();

            },
            error:function(){
                Common.toast("服务器异常, 获取定位地址失败");
            }
        });
    },
    //校验手机号是否合法
    isPhoneNumValid: function(phoneNum) {
        var myReg = /^\d{11}$/;

        if(!phoneNum) {
            Common.toast("手机号不能为空");
            return false;
        }

        if(!myReg.test(phoneNum)){
            Common.toast('请输入有效的手机号码！');
            return false;
        }

        return true;
    },
    /*
      * 切换显示密码
    */
    switchPasswordInputType: function(elementId) {
        if(!elementId) {
            return;
        }
        var $element = $('#' + elementId);
        if(!$element.length) {
            console.log("element is not found");
            return;
        }
        var type = $element.attr('type');
        if(type === "password") {
            $element.attr('type', 'text');
        } else {
            $element.attr('type', 'password');
        }
    }
}

Register.init();