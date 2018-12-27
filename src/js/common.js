/*
* 公共类
* */
'use strict';

var CLS_HIDE = 'hide';
//dev
//var SeverUrl = "http://47.97.199.81";
//prod
var SeverUrl = "";

var Common = {
    /*
    * 添加加载中页面
    * */
    addLoadingPage: function() {
        if($('.app-loading').length <= 0) {
            var $loadingElem = $('<div class="app-loading"><img src="image/loading.gif"></div>');
            $(document.body).append($loadingElem);
        } else {
            $('.app-loading').removeClass(CLS_HIDE);
        }
    },
    /*
    * 关闭加载中页面
    * */
    hideLoadingPage: function() {
        if($('.app-loading').length <= 0) {
            return;
        }
        $('.app-loading').addClass(CLS_HIDE);
    },
    /*
    * 显示错误页面
    * */
    showErrorPage: function(text) {
        $("body div").remove();

        text = text || "服务器不太给力, 请退出重试或联系客服";

        var html = '<div class="app-load-error">' +
            '    <img src="image/no-result.png">' +
            '    <p class="error-text">'+ text +'</p>' +
            '</div>';

        $(document.body).append($(html));
    },
    // 提示
    toast: function(text) {
        if($('.toast').length <= 0) {
            var $toast = $('<span class="toast" style="display: none">'+ text +'</span>');
            $(document.body).append($toast);
        } else {
            $('.toast').html(text);
        }

        $('.toast').fadeIn();

        setTimeout(function () {
            $('.toast').fadeOut();
        }, 3*1000);
    },
    /*
    * 获取url参数
    * */
    getUrlParam: function(paraName) {
        var url = document.location.toString();
        var arrObj = url.split("?");

        if (arrObj.length > 1) {
            var arrPara = arrObj[1].split("&");
            var arr;

            for (var i = 0; i < arrPara.length; i++) {
                arr = arrPara[i].split("=");

                if (arr != null && arr[0] == paraName) {
                    return arr[1];
                }
            }
            return "";
        }
        else {
            return "";
        }
    }
}