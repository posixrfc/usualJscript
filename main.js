if(!self._){
	self._={debug:location.hostname.startsWith("127.0.") || location.hostname.startsWith("192.168.") || location.hostname.startsWith("localhost") || location.hostname.startsWith("172.") || location.hostname.startsWith("10.")};
}//_.debug=true;
document.addEventListener("DOMContentLoaded",()=>{
	let screeny=document.documentElement.clientHeight;
	document.body.style.minHeight=screeny+"px";
});
_.hreq=(method,path,data,header,succ,fail)=>{
	let req=new self.XMLHttpRequest();
	req.onreadystatechange=()=>{
		if(4!==req.readyState){
			return;
		}
		if(200===req.status){
			if("function"===typeof succ){
				succ(req.responseText,req);
			}
			return;
		}
		if("function"===typeof fail){
			fail(req.responseText,req);
		}
	};
	let mimeType="application/x-www-form-urlencoded",noMimeType=true;
	if(header){
		for(head in header){
			if("Content-Type"===head){
				mimeType=header[head];
				if("multipart/form-data"===mimeType){
					delete header[head];
				}
				noMimeType=false;
				break;
			}
		}
	}
	let dataEncoded="";
	if("GET"===method){
		if(data){
			if("string"===typeof data){
				dataEncoded=data;
			}else if("object"===typeof data){
				for(name in data){
					dataEncoded+="&"+self.encodeURIComponent(name)+"="+self.encodeURIComponent(data[name]);
				}
				if(0!==dataEncoded.length){
					dataEncoded=dataEncoded.substring(1);
				}
			}
		}
	}else{
		switch(mimeType){
			case "application/x-www-form-urlencoded":
				if(!data){
					break;
				}
				if("string"===typeof data){
					dataEncoded=data;
					break;
				}
				if("object"===typeof data){
					for(name in data){
						dataEncoded+="&"+self.encodeURIComponent(name)+"="+self.encodeURIComponent(data[name]);
					}
					if(0!==dataEncoded.length){
						dataEncoded=dataEncoded.substring(1);
					}
				}
				break;
			case "application/json":
				if(!data){
					break;
				}
				if("string"===typeof data){
					dataEncoded=data;
					break;
				}
				if("object"===typeof data){
					dataEncoded=self.JSON.stringify(data);
				}
				break;
			case "text/xml":
			case "application/xml":
				if(!data){
					break;
				}
				if("string"===typeof data){
					dataEncoded=data;
					break;
				}
				dataEncoded=_.obj2xml('xml',data);
				break;
			case "text/plain":
				if(!data){
					break;
				}
				if("string"===typeof data){
					dataEncoded=data;
				}
				break;
			case "multipart/form-data":
				if(!data){
					break;
				}
				if(data instanceof FormData){
					dataEncoded=data;
					break;
				}
				if("object"===typeof data){
					dataEncoded=new FormData();
					for(name in data){
						dataEncoded.append(name,data[name]);
					}
				}
				break;
			default://application/octet-stream
				dataEncoded=data;
		}
	}
	if("GET"===method){
		if(dataEncoded){
			req.open(method,path+"?"+dataEncoded,true);
		}else{
			req.open(method,path,true);
		}
	}else{
		req.open(method,path,true);
	}
	if(header){
		for(head in header){
			req.setRequestHeader(head,header[head]);
		}
	}
	if(noMimeType){
		req.setRequestHeader("Content-Type",mimeType);
	}
	if("GET"===method){
		req.send();
	}else{
		if(dataEncoded){
			req.send(dataEncoded);
		}else{
			req.send();
		}
	}
};
_.obj2xml=(key,val)=>{
	if("number"===typeof val){
		return '<'+key+'>'+val+'</'+key+'>';
	}
	if("boolean"===typeof val){
		return '<'+key+'>'+val+'</'+key+'>';
	}
	if(!val){
		return null;
	}
	if("string"===typeof val){
		return '<'+key+'>'+val+'</'+key+'>';
	}
	let rs='';
	if(Array.isArray(val)){
		for(let i=0,tmp;i!==val.length;i++){
			tmp=_.obj2xml(key,val[i]);
			if(tmp){
				rs+=tmp;
			}
		}
		return 0===rs.length?null:rs;
	}
	let mismatch=true;
	rs='<'+key+'>';
	for(let k in val){
		tmp=_.obj2xml(k,val[k]);
		if(tmp){
			mismatch=false;
			rs+=tmp;
		}
	}
	if(mismatch){
		return null;
	}
	return rs+'</'+key+'>';
};
_.xml2obj=(obj,val)=>{
	val=val.trim();
	if(0===val.length){
		return false;
	}
	if(val.charAt(0)!=='<'){
		return false;
	}
	let idx=val.indexOf('>',2);
	if(-1===idx){
		return false;
	}
	let tag=val.substring(1,idx);
	if(idx+idx+3>=val.length){
		return false;
	}
	val=val.substring(idx+1).trim();
	idx=val.indexOf('</'+tag+'>');
	if(-1===idx){
		return false;
	}
	let tmp=idx-tag.length-2,noTag=true;
	while(tmp>=0 && ((tmp=val.lastIndexOf('<'+tag+'>',tmp))!==-1)){
		noTag=false;
		idx=idx+tag.length+3;
		if(idx+tag.length+3>=val.length){
			return false;
		}
		idx=val.indexOf('</'+tag+'>',idx);
		if(-1===idx){
			return false;
		}
		if(idx+tag.length+3===val.length){
			break;
		}
		tmp=tmp-tag.length-2;
	}
	let cnt=val.substring(0,idx).trim();
	val=val.substring(idx+tag.length+3);
	if(noTag && cnt.indexOf('<')!==-1){
		noTag=false;
	}
	if(noTag){
		if(obj[tag]){
			if(Array.isArray(obj[tag])){
				obj[tag].push(cnt);
			}else{
				obj[tag]=[obj[tag]];
				obj[tag].push(cnt);
			}
		}else{
			obj[tag]=cnt;
		}
	}else{
		if(obj[tag]){
			tmp={};
			if(Array.isArray(obj[tag])){
				obj[tag].push(tmp);
			}else{
				obj[tag]=[obj[tag]];
				obj[tag].push(tmp);
			}
		}else{
			tmp=obj[tag]={};
		}
		if(!_.xml2obj(tmp,cnt)){
			delete obj[tag];
			return false;
		}
	}
	return val ? _.xml2obj(obj,val) : true;
};
_.showTip=(val,ms=1234)=>{
	let screenx=document.documentElement.clientWidth,tipx=320,screeny=document.documentElement.clientHeight,tipy=45;
	let blur=document.createElement("aside"),tiper=document.createElement("span"),wrper=document.createElement("nav");
	document.body.appendChild(blur);
	document.body.appendChild(wrper);
	wrper.appendChild(tiper);
	blur.style.position=wrper.style.position="fixed";
	blur.style.zIndex=wrper.style.zIndex="2";
	tiper.style.color="white";
	tiper.style.display="inline-block";
	blur.style.backgroundColor="rgba(0,0,0,0.5)";
	wrper.style.backgroundColor="transparent";
	tiper.style.backgroundColor="#111111";
	tiper.innerText=val;
	self.setTimeout(()=>{wrper.removeChild(tiper);document.body.removeChild(wrper);document.body.removeChild(blur);},ms);
	blur.style.width=wrper.style.width=screenx+"px";
	blur.style.height=screeny+"px";
	blur.style.top=blur.style.left=wrper.style.left="0px";
	wrper.style.height=tipy+"px";
	tiper.style.height=tiper.style.lineHeight=wrper.style.height;
	wrper.style.textAlign=tiper.style.textAlign="center";
	tiper.style.borderRadius=tipy/2+"px";
	wrper.style.top=(screeny-tipy)/2+"px";
	//tiper.style.left=(screenx-tipx)/2+"px";
	tiper.style.margin="0px auto";
	tiper.style.padding="0px 1.2rem";
};
_.showLoading=(val)=>{
	let screenx=document.documentElement.clientWidth,screeny=document.documentElement.clientHeight;
	let blur=document.createElement("aside"),wrper=document.createElement("nav"),tipx=130,tipy=130;
	document.body.appendChild(blur);
	document.body.appendChild(wrper);
	let tmpHTML='<img style="position:static;display:block;width:4rem;height:4rem;margin:0.7rem auto 0.1rem;background-color:transparent;" src="loading.gif"/>';
	tmpHTML+='<span style="position:static;display:inline-block;text-align:center;color:black;width:100%;height:2rem;font-size:0.9rem;">'+val+'</span>';
	wrper.innerHTML=tmpHTML;
	blur.style.position=wrper.style.position="fixed";
	blur.style.zIndex=wrper.style.zIndex="2";
	blur.style.backgroundColor="rgba(0,0,0,0.5)";
	wrper.style.backgroundColor="white";
	blur.style.width=screenx+"px";
	blur.style.height=screeny+"px";
	blur.style.top=blur.style.left="0px";
	wrper.style.width=tipx+"px";
	wrper.style.height=tipy+"px";
	wrper.style.borderRadius="11px";
	wrper.style.top=(screeny-tipy)/2+"px";
	wrper.style.left=(screenx-tipx)/2+"px";
	return ()=>{wrper.innerHTML=null;document.body.removeChild(wrper);document.body.removeChild(blur);};
};
_.showConfirm=(val,okfn,nofn,lines=1)=>{
	//val="截至1月5日24时，据31个省（自治区、直辖市）和新疆生产建设兵团报告，现有确诊病例443例（其中重症病例14例），累计治愈出院病例82138例，累计死亡病例4634例，累计报告确诊病例87215例，现有疑似病例3例。累计追踪到密切接触者912596人，尚在医学观察的密切接触者17736人";
	//val="如果您需要创建包含文本的新段落，请记得添加到段落的文本的文本节点，然后向文档添加该段落";
	//val="如果您需要创建包含文本的新段落，请记得添加到段落的文本的文本节点";
	let screenx=document.documentElement.clientWidth,screeny=document.documentElement.clientHeight;
	let blur=document.body.appendChild(document.createElement("aside")),tipx=320;
	let wrper=document.body.appendChild(document.createElement("nav")),tipy=99;
	wrper.innerHTML='<span style="position:static;display:inline-block;text-align:center;color:black;width:100%;font-weight:bold;font-size:0.9rem;">'+val+'</span>';
	
	blur.style.position=wrper.style.position="fixed";
	blur.style.zIndex=wrper.style.zIndex="2";
	blur.style.backgroundColor="rgba(0,0,0,0.5)";
	wrper.style.backgroundColor="white";
	blur.style.width=screenx+"px";
	wrper.style.width=tipx+"px";
	wrper.style.boxSizing="border-box";
	wrper.style.padding="1rem";
	blur.style.height=screeny+"px";
	wrper.style.height=tipy+lines*20+"px";
	blur.style.top=blur.style.left="0px";
	wrper.style.textAlign="center";
	wrper.style.borderRadius="9px";
	wrper.style.top=(screeny-tipy)/2+"px";
	wrper.style.left=(screenx-tipx)/2+"px";
	
	okele=wrper.appendChild(document.createElement("button"));
	noele=wrper.appendChild(document.createElement("button"));
	okele.innerText="确  定",noele.innerText="取  消";
	okele.onclick=noele.onclick=function(){
		if(okele===this && "function"===typeof okfn){
			okfn(this);
		}
		if(noele===this && "function"===typeof nofn){
			nofn(this);
		}
		okele.onclick=noele.onclick=undefined;
		wrper.innerHTML=null;
		document.body.removeChild(wrper);
		document.body.removeChild(blur);
	};
	okele.style.backgroundColor=noele.style.backgroundColor="#abcdef";
	okele.style.color=noele.style.color="blue";
	okele.style.display=noele.style.display="inline-block";
	okele.style.width=noele.style.width="3.2rem";
	okele.style.height=noele.style.height="1.9rem";
	okele.style.borderRadius=noele.style.borderRadius="0.2rem";
	okele.style.lineHeight=noele.style.lineHeight="1.7rem";
	okele.style.textAlign=noele.style.textAlign="center";
	okele.style.border=noele.style.border="1px solid lightgray";
	okele.style.position=noele.style.position="absolute";
	okele.style.bottom=noele.style.bottom="1rem";
	okele.style.left=noele.style.right="3rem";
	okele.style.fontWeight=noele.style.fontWeight="bold";
};
_.showPage=pid=>{
	let retValue=null;
	for(let page of document.getElementsByClassName("page")){
		if(page.id===pid){
			page.style.display="block";
			retValue=page;
		}else{
			page.style.display="none";
		}
	}
	return retValue;
};
_.execScript=(url,sync=true)=>{
	let exe=document.createElement("script");
	exe.type="text/javascript";
	exe["char"+"set"]="utf-8";
	if(url){
		exe.src=url;
	}
	exe.async=!sync;
	return document.head.appendChild(exe);
};
_.id=p=>{return document.getElementById(p);};
_.name=p=>{return document.getElementsByName(p);};
_.tag=p=>{return document.getElementsByTagName()(p);};
_.cls=p=>{return document.getElementsByClassName(p);};
_.init=fn=>{document.addEventListener("DOMContentLoaded",fn);};
_.load=fn=>{self.addEventListener("load",fn);};
_.crt=p=>{return document.createElement(p);};
_.css=(p)=>{return document.querySelectorAll(p);};
_.retainTemporary=(key,val)=>{self.sessionStorage.setItem(key,val);};
_.obtainTemporary=key=>{return self.sessionStorage.getItem(key);};
_.deleteTemporary=key=>{self.sessionStorage.removeItem(key);};
_.retainPermanent=(key,val)=>{self.localStorage.setItem(key,val);};
_.obtainPermanent=key=>{return self.localStorage.getItem(key);};
_.deletePermanent=key=>{self.localStorage.removeItem(key);};