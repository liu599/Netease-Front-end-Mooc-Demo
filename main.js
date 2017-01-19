/*
 * 网易前端工程师 微专业大作业
 * https://github.com/liu599/Netease-Front-end-Mooc-Demo/
 *
 * Copyright 2016, Tokei
 * https://blog.nekohand.moe
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * 
 * 
 * 
 * 
 * 
 * 
 * See http://smilex.nekohand.moe for more info.
 */
 
;(function ($) {
/*右侧课程计数器*/
var courseNumber = 0;
/*接口地址*/
var addressBook = {
    attentionUrl: 'http：//study.163.com/webDev/attention.htm',
    loginUrl: 'http://study.163.com/webDev/login.htm',
    courseUrl: 'http://study.163.com/webDev/couresByCategory.htm',
    hotcourseUrl: 'http://study.163.com/webDev/hotcouresByCategory.htm',
    videoUrl: 'http://mov.bn.netease.com/open-movie/nos/mp4/2014/12/30/SADQ86F5S_shd.mp4'
};
/* DOM基本数据查询 */
function $(selector){
    var firstWord = selector.substring(0,1);
    if(firstWord=="#")
      return document.getElementById(selector.substring(1,selector.length)); 
	else
	  //console.log(selector);
	  return document.querySelector(selector);
}



/* Event 函数 */
var EventUtil = { 
    getEvent: function(event){ 
            return event ? event : window.event; 
    },
    getTarget: function(event){ 
        return event.target || event.srcElement; 
    },
    preventDefault: function(event){ 
        if (event.preventDefault){ 
            event.preventDefault(); 
        } else { 
            event.returnValue = false; 
        } 
    },
    stopPropagation: function(event){
        if (event.stopPropagation){ 
            event.stopPropagation(); 
        } else { 
            event.cancelBubble = true; 
        } 
    },
    addHandler: function(element, type, handler){ 
        if (element.addEventListener){ 
            element.addEventListener(type, handler, false);  //DOM2
        } else if (element.attachEvent){ 
            element.attachEvent("on" + type, handler);  //IE
        } else { 
            element["on" + type] = handler;  //DOM 0 
        } 
    }, 
    removeHandler: function(element, type, handler){ 
        if (element.removeEventListener){ 
            element.removeEventListener(type, handler, false); //DOM2
        } else if (element.detachEvent){ 
            element.detachEvent("on" + type, handler); //IE
        } else { 
            element["on" + type] = null; //DOM 0 
        } 
    } 
};
/*Cookie处理*/
var CookieUtil = {
    getCookies: function(){
        CookieObj = {};
        var thisCookie = document.cookie;
        if(thisCookie === '') return CookieObj;
        var listObj = thisCookie.split(';');
        for(var i=0, len=listObj.length;i<len;i++){
            var item = listObj[i];
            var w = item.split('=');
            var name = w[0].replace(/^\s+|\s+$/g,"");
            var value = w[1];
		    name = decodeURIComponent(name);
		   	value = decodeURIComponent(value);
		    CookieObj[name] = value;
        }
        return CookieObj;
        //console.log(thisCookie);
    },
    setCookies: function(name,value,path,iDay,domain,secure){
        var oDate=new Date();
	    oDate.setDate(oDate.getDate()+iDay);
	    var cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);
	    if (iDay) {
		cookie+=';expires=' + oDate;
        	}
    	if (path) {
    		cookie+=';path=' + path;
    	}
    	if (domain) {
    		cookie+=';domain' + domain;
    	}
    	if (secure) {
    		cookie+=';secure' + secure;		
    	}
    	document.cookie = cookie;
    }
};
/*Ajax get方法的js封装*/
var Ajax = {
    get: function(url,options,callback){
        //1.创建ajax对象 
        /**
         * 此处必须需要使用window.的方式,表示为window对象的一个属性.不存在时值为undefined,进入else
         * 若直接使用XMLHttpRequest,在不支持的情况下会报错
         **/
        
        var xhr = null;
        xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP"); // 其他：IE6
         //2.连接服务器
         //open(方法,url,是否异步)
        var para = Ajax.serialize(options);
        if(para) { url = url + "?" + para; }
        //console.log(url);
        xhr.open("get", url, true);
        //3.发送请求
        xhr.send(null);
        //4. 接收返回
        xhr.onreadystatechange = function(){
            if (xhr.readyState === 4){
                if ((xhr.status >= 200 && xhr.status <300) || xhr.status ===304){
                    //console.log('成功获取数据');
    				var data = JSON.parse(xhr.responseText);
    				//console.log(data);
    				if (typeof callback == 'function') {
    					callback(data,options);
    				}else{
    				    console.log("not a function");
    				}
                }else{
                    console.log("请求失败" + xhr.status);
                    if(options.failHandler){
                        options.failHandler(xhr);
                    }
                }
            }
        };
         
    },
    // 处理URL
    serialize: function(data){
        if (!data) return "";
        var temp = [];
        for(var name in data){
            if (!data.hasOwnProperty(name)) continue;
            if (typeof data[name] === "function") continue;
            var value =data[name].toString();
            name = encodeURIComponent(name); 
            value = encodeURIComponent(value);
            temp.push(name + "=" + value);
        }
        return temp.join("&");
    }
};

/* 左侧栏目获取 */
var getleftCourses = {
    init: function(option){
        var defaultOption = {pageNo:1,psize:20,type:10};
        if(!option){
            option = defaultOption;
        }
        var courseData = Ajax.get(addressBook.courseUrl,option,getleftCourses.courseHandler);
    },
    courseHandler: function(data, options){
        var baseEle = $('.courses .left .course-card');
        baseEle.innerHTML = '';
        //console.log(baseEle);
        var CardEle;
        for (var i = 0; i < data.list.length; i++) {
            //console.log(data.list[i]);
            
            CardEle = getleftCourses.cardCreate(data.list[i]);
		    baseEle.insertBefore(CardEle,baseEle.firstChild);

	    }
        
        console.log('Success');
    },
    cardCreate: function(data){
        var card = document.createElement('div');
        card.setAttribute('class','card-element');
        var price = (data.price===0)?'免费':('￥' + data.price);
        var html='<div class="courseImg"><img width="223px" height="124px" src=';
    	html+=data.middlePhotoUrl;
    	html+='></div><div class="courseInfo"><p class="courseName t-inline">';
    	html+=data.name;
    	html+='</p><p class="courseProvider">'+data.provider;
    	html+='</p><div class="courseLearner"><i class="cardIcon"></i>';
    	html+=data.learnerCount;
    	html+='</div><p class="price">'+ price;
    	html+='</p></div><div class="courseDetail"><img width="223px" height="124px" src=';
    	html+=data.middlePhotoUrl;
    	html+='><div class="courseInfo"><p class="title t-inline">';
    	html+=data.name;
    	html+='</p><div class="courseCount"><i class="cardIcon"></i>';
    	html+=data.learnerCount+'人在学';
    	html+='<p class="provider">'+'发布者：'+data.provider;
    	html+='</p><p class="category">'+'分类：'+data.categoryName;
    	html+='</p></div></div><div class="description clearfix"><p>';
    	html+=data.description;
    	html+='</p></div></div>';
    	card.innerHTML=html;
    	
    	return card;
        
    }
    
}
/* 右侧栏目获取 */
var rightCourses = {
    init: function(){
        //console.log('right');
        rightCourses.coursesGet();
    },
    coursesCreate: function(courseDataX, options){
        var courseContent=document.createElement('div');
        var html='<div class="pop-info clearfix"><img width="50px" height="50px" src=';
        var sp = courseNumber;
        //var courseLength = courseDataX.length;
        
        console.log(sp);
        for (var index = sp ; index<sp+10;index++){
           // console.log(courseDataX[index]);
            index = (index>20)?index-10:index;
            var courseData = courseDataX[index];
            
        	
        	html+=courseData.smallPhotoUrl;
        	html+='><div class="pop-des"><p class="t-inline">';
        	html+=courseData.name;
        	html+='</p><span><i class="cardIcon"></i>';
        	html+=courseData.learnerCount;
        	html+='</span></div></div>';
        	if((index+1)==courseDataX.length){
        	   html+='<br>';
        	}else{
        	   html+= '<div class="pop-info clearfix"><img width="50px" height="50px" src=';
        	}
        	
        	
        }
        courseContent.innerHTML=html;
        $('.pop').innerHTML = '';
        $('.pop').appendChild(courseContent);
        //console.log(courseContent);
        courseNumber++;
        return courseContent;
    },
    coursesGet: function(){
        Ajax.get(addressBook.hotcourseUrl,'',rightCourses.coursesCreate);
    },
}

/*主函数*/
var SPF = {
    init: function(){
        SPF.topNotice();
        SPF.focusBtn();
        SPF.Slider();
        SPF.leftCourse();
        SPF.pageLoad();
        SPF.rightVideo();
        SPF.rightCourse();
    },
    // 顶部通知 
    topNotice: function(){
        var cookie = CookieUtil.getCookies();
        //console.log(cookie);
        var noticeEle = $('.notice');
        //console.log(noticeEle);
        var noticeClose2 = $('#close');
        //console.log(noticeClose2);
        if(cookie.noNoticeRemind){
            console.log("User Cookie On");
		    noticeEle.style.display='none';
        }else{
            console.log("User Cookie Off");
          
            noticeClose2.onclick = function(){
                   console.log("Close by user"); 
                   CookieUtil.setCookies('noNoticeRemind',true,'/',1);
                   noticeEle.style.display='none';
            };
        }
    },
    // 关注按钮
    focusBtn: function(){

        var focusBtn = $('.logo-focus');
        var focusCancel = $('.logo-focus2');
        EventUtil.addHandler(focusBtn,"click",function(){
    		var myCookie = CookieUtil.getCookies();
    		console.log(!myCookie.loginSuc);
    		if (!myCookie.loginSuc) {
    		    console.log('not logged in');
    			SPF.loginWindow();
    		}else{
    			SPF.showFocusedBtn();
    		}
    	});
        
    },
    showFocusedBtn: function(){
        var focusBtn = $('.logo-focus');
        var focusCancel = $('.logo-focus2');
        focusBtn.style.display='none';
        focusCancel.style.display='';
        CookieUtil.setCookies('followSuc',true,'/',30);
        EventUtil.addHandler(focusCancel,"click",function(){
    		CookieUtil.setCookies('followSuc','','/',30);
    		CookieUtil.setCookies('loginSuc','','/',30);
    		focusBtn.style.display='';
            focusCancel.style.display='none';
    	});
    },
    // 弹出登录窗口
    loginWindow: function(){
        var loginEle = $('.w-login');
	    var closeBtn = $('.login-close');

	    var form = $('.w-login form');
	    console.log('form');
	    loginEle.style.display = 'block';
	    EventUtil.addHandler(closeBtn,'click',function(){
    		loginEle.style.display ='none';
    		
    	});
	    EventUtil.addHandler(form,'submit',function(event){
    		event =EventUtil.getEvent(event);
    		EventUtil.preventDefault(event);
    		var name=form.elements['usr'];
    		var password=form.elements['pwd'];
    		options={userName:md5(name.value),password:md5(password.value)};
    		
    		Ajax.get(addressBook.loginUrl,options,function(data,options){
    			if (data&&data==1) {
    				loginEle.style.display='none';
    				CookieUtil.setCookies('loginSuc',true,'/',90);
    				SPF.showFocusedBtn();
    			}else{
    				$('#hint').style.display='block';
    			}
    		});
    	});
    },
    // 图片轮播动作
    slide: function(current, next, button){
        var imagelist = document.querySelectorAll('.m-wrap');
        var curImage = imagelist[current];
        var nextImage = imagelist[next];
       // console.log(curImage);

	    button[next].className='on';
	    button[current].className='';
	    var timer = setInterval(function(){
	        clearInterval(timer);
	        nextImage.style.display='block';
    		curImage.style.display='none';
	    },100);
	    return timer;
    },
    //Silder图片轮播
    Slider: function(){
        var slider = $('.slider');
    	var buttons = document.querySelectorAll('#buttons span');
    	var index =0;
    	var timer;
    	var imageChanging = function(){
            	    var current=(index==2)?0:index+1;
            		SPF.slide(index,current,buttons);
            		index = current;
            	};
    	var timerChange = setInterval(imageChanging,5000);
        EventUtil.addHandler(slider,'mouseover',function(){
    		if(timerChange){
    			clearInterval(timerChange);
    		}
    	});
    	EventUtil.addHandler(slider,'mouseout',function(){
    		timerChange = setInterval(imageChanging,5000);
    	});
    	for (var i = 0; i < buttons.length; i++) {
    		    buttons[i].onclick = function(){
    			var myindex= parseInt(this.getAttribute('index'));
    			//console.log(myindex);
    			clearInterval(timer);
    			timer=SPF.slide(index,myindex-1,buttons);
    			index=myindex-1;
    		};
    	}
    },
    //Courses左侧课程列表
    leftCourse: function(){
        var buttonlist = document.querySelectorAll('.c-tab-1');
        for(var i=0;i<buttonlist.length;i++){
            var option = [];
            EventUtil.addHandler(buttonlist[i], 'click', function(){
                //console.log(this);
                option['pageNo'] = 1;
                option['psize'] = 20;
                option['type'] = this.getAttribute('data-type');
                //console.log(option);
                getleftCourses.init(option);
                for(var j=0;j<buttonlist.length;j++){
                   buttonlist[j].setAttribute('class','c-tab-1');
                }
                this.setAttribute('class','active');
                var items = document.querySelectorAll('.page-index span');
        	    for(k=1;k<items.length-1;k++){
        	        //console.log(items[k])
        	        items[k].setAttribute('class',''); 
        	        
        	    }
        	    items[1].setAttribute('class','action');
                
            });
        }
        getleftCourses.init();
        
    },
    //Video右侧弹窗
    rightVideo: function(){
        var movie = $('.movie-info');
        var videoEleContainer = $('.video-container');
        var videoEle = $('.video-container .video');
        var closeBtn = $('.closeBtn');
        EventUtil.addHandler(closeBtn,'click',function(){
    		videoEleContainer.style.display ='none';
    	});
    	EventUtil.addHandler(movie,'click',function(){
    		videoEleContainer.style.display ='block';
    		$('#sample-video').setAttribute('src',addressBook.videoUrl);
    	});
    },
    //右侧课程列表
    rightCourse: function(){
        
        setInterval(function(){rightCourses.init();},5000);
    },
    // 左侧分页加载
    pageLoad: function(){
        var prev = document.createElement('span');
        prev.setAttribute('data-type','prev');
        prev.innerHTML = '<';
        EventUtil.addHandler(prev,'click',function(){
                var option = {};
                var pageNumber = $('.action').getAttribute('data-type');
                
                option['psize'] = 20;
                option['type'] = $('.active').getAttribute('data-type');
                pageNumber = (pageNumber==1) ?3:(pageNumber - 1);
                option['pageNo'] = pageNumber;
                Ajax.get(addressBook.courseUrl,option,getleftCourses.courseHandler);
                var items = document.querySelectorAll('.page-index span');
        	    for(k=1;k<items.length-1;k++){
        	        items[k].setAttribute('class',''); 
        	    }
        	    items[pageNumber].setAttribute('class','action');
        });
         $('.page-index').appendChild(prev);
        for(var j=1;j<4;j++){
        	var item = document.createElement('span');
        	item.setAttribute('data-type',j);
        	item.innerHTML = j;
        	EventUtil.addHandler(item,'click',function(){
        	    var items = document.querySelectorAll('.page-index span');
        	    for(k=1;k<items.length-1;k++){
        	        items[k].setAttribute('class',''); 
        	    }
        	    this.setAttribute('class','action');
        	    var option = {};
        	    option['pageNo'] = this.getAttribute('data-type');
                option['psize'] = 20;
                option['type'] = $('.active').getAttribute('data-type');
        	    var courseData = Ajax.get(addressBook.courseUrl,option,getleftCourses.courseHandler);
        	});
        	if(j==1){
        	    item.setAttribute('class','action');
        	}
        	$('.page-index').appendChild(item);
        	
    	}
    	
    	var next = document.createElement('span');
        next.setAttribute('data-type','next');
        next.innerHTML = '>';
        EventUtil.addHandler(next,'click',function(){
                var option = {};
                var pageNumber = $('.action').getAttribute('data-type');
                console.log(pageNumber);
                option['psize'] = 20;
                option['type'] = $('.active').getAttribute('data-type');
                pageNumber = (pageNumber==3) ?1:(++pageNumber);
                console.log(pageNumber);
                option['pageNo'] = pageNumber;
                Ajax.get(addressBook.courseUrl,option,getleftCourses.courseHandler);
                var items = document.querySelectorAll('.page-index span');
        	    for(var k=1;k<items.length-1;k++){
        	        items[k].setAttribute('class',''); 
        	    }
        	    items[pageNumber].setAttribute('class','action');
        });
        $('.page-index').appendChild(next);
        
    }
};
SPF.init();

}(this));
