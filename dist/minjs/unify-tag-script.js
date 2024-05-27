"use strict";(()=>{var ft=Object.defineProperty,gt=Object.defineProperties;var mt=Object.getOwnPropertyDescriptors;var Z=Object.getOwnPropertySymbols;var yt=Object.prototype.hasOwnProperty,ht=Object.prototype.propertyIsEnumerable;var q=(t,e,n)=>e in t?ft(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,d=(t,e)=>{for(var n in e||(e={}))yt.call(e,n)&&q(t,n,e[n]);if(Z)for(var n of Z(e))ht.call(e,n)&&q(t,n,e[n]);return t},y=(t,e)=>gt(t,mt(e));var h="https://unifyintent.com/analytics/api/v1";var xt=/^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$/;function F(t,e){var n;return((n=e==null?void 0:e.getTime())!=null?n:new Date().getTime())+t*60*1e3}var x=()=>({path:window.location.pathname,query:vt(window.location.href),referrer:document.referrer,title:document.title,url:window.location.href}),v=()=>({userAgent:window.navigator.userAgent,userAgentData:window.navigator.userAgentData}),_=t=>{if(xt.test(t))return t},vt=t=>{let e=new URL(t).searchParams,n={};for(let[r,o]of e.entries())n[r]=o;return n};var $=()=>{var n,r,o,i,s;let t=new URL(location.href),e={source:(n=t.searchParams.get("utm_source"))!=null?n:void 0,medium:(r=t.searchParams.get("utm_medium"))!=null?r:void 0,campaign:(o=t.searchParams.get("utm_campaign"))!=null?o:void 0,term:(i=t.searchParams.get("utm_term"))!=null?i:void 0,content:(s=t.searchParams.get("utm_content"))!=null?s:void 0};return y(d({locale:navigator.language},v()),{utm:e})};var P=class{constructor(e){this.getBaseActivityPayload=()=>({type:this.getActivityType(),anonymousUserId:this._intentContext.identityManager.getOrCreateAnonymousUserId(),sessionId:this._intentContext.sessionManager.getOrCreateSession().sessionId,context:$(),timestamp:new Date().toISOString()});this._intentContext=e}track(){this._intentContext.apiClient.post(this.getActivityURL(),d(d({},this.getBaseActivityPayload()),this.getActivityData()))}},I=P;var _t=`${h}/page`,A=class extends I{constructor(){super(...arguments);this.getActivityData=()=>({type:"page",properties:x()})}getActivityType(){return"page"}getActivityURL(){return _t}};var It=`${h}/identify`,l=class extends I{constructor(n,{email:r}){super(n);this.getActivityData=()=>({type:"identify",traits:{email:this._email}});this._email=r}getActivityType(){return"identify"}getActivityURL(){return It}};var S,At=new Uint8Array(16);function L(){if(!S&&(S=typeof crypto!="undefined"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!S))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return S(At)}var a=[];for(let t=0;t<256;++t)a.push((t+256).toString(16).slice(1));function G(t,e=0){return a[t[e+0]]+a[t[e+1]]+a[t[e+2]]+a[t[e+3]]+"-"+a[t[e+4]]+a[t[e+5]]+"-"+a[t[e+6]]+a[t[e+7]]+"-"+a[t[e+8]]+a[t[e+9]]+"-"+a[t[e+10]]+a[t[e+11]]+a[t[e+12]]+a[t[e+13]]+a[t[e+14]]+a[t[e+15]]}var St=typeof crypto!="undefined"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto),N={randomUUID:St};function Ut(t,e,n){if(N.randomUUID&&!e&&!t)return N.randomUUID();t=t||{};let r=t.random||(t.rng||L)();if(r[6]=r[6]&15|64,r[8]=r[8]&63|128,e){n=n||0;for(let o=0;o<16;++o)e[n+o]=r[o];return e}return G(r)}var g=Ut;function U(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var r in n)t[r]=n[r]}return t}var Ct={read:function(t){return t[0]==='"'&&(t=t.slice(1,-1)),t.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent)},write:function(t){return encodeURIComponent(t).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,decodeURIComponent)}};function O(t,e){function n(o,i,s){if(typeof document!="undefined"){s=U({},e,s),typeof s.expires=="number"&&(s.expires=new Date(Date.now()+s.expires*864e5)),s.expires&&(s.expires=s.expires.toUTCString()),o=encodeURIComponent(o).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape);var c="";for(var p in s)s[p]&&(c+="; "+p,s[p]!==!0&&(c+="="+s[p].split(";")[0]));return document.cookie=o+"="+t.write(i,o)+c}}function r(o){if(!(typeof document=="undefined"||arguments.length&&!o)){for(var i=document.cookie?document.cookie.split("; "):[],s={},c=0;c<i.length;c++){var p=i[c].split("="),lt=p.slice(1).join("=");try{var B=decodeURIComponent(p[0]);if(s[B]=t.read(lt,B),o===B)break}catch(zt){}}return o?s[o]:s}}return Object.create({set:n,get:r,remove:function(o,i){n(o,"",U({},i,{expires:-1}))},withAttributes:function(o){return O(this.converter,U({},this.attributes,o))},withConverter:function(o){return O(U({},this.converter,o),this.attributes)}},{attributes:{value:Object.freeze(e)},converter:{value:Object.freeze(t)}})}var V=O(Ct,{path:"/"});var f=typeof Buffer=="function",J=typeof TextDecoder=="function"?new TextDecoder:void 0,X=typeof TextEncoder=="function"?new TextEncoder:void 0,bt="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",m=Array.prototype.slice.call(bt),C=(t=>{let e={};return t.forEach((n,r)=>e[n]=r),e})(m),Et=/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/,u=String.fromCharCode.bind(String),Q=typeof Uint8Array.from=="function"?Uint8Array.from.bind(Uint8Array):t=>new Uint8Array(Array.prototype.slice.call(t,0)),Tt=t=>t.replace(/=/g,"").replace(/[+\/]/g,e=>e=="+"?"-":"_"),tt=t=>t.replace(/[^A-Za-z0-9\+\/]/g,""),wt=t=>{let e,n,r,o,i="",s=t.length%3;for(let c=0;c<t.length;){if((n=t.charCodeAt(c++))>255||(r=t.charCodeAt(c++))>255||(o=t.charCodeAt(c++))>255)throw new TypeError("invalid character found");e=n<<16|r<<8|o,i+=m[e>>18&63]+m[e>>12&63]+m[e>>6&63]+m[e&63]}return s?i.slice(0,s-3)+"===".substring(s):i},et=typeof btoa=="function"?t=>btoa(t):f?t=>Buffer.from(t,"binary").toString("base64"):wt,Dt=f?t=>Buffer.from(t).toString("base64"):t=>{let n=[];for(let r=0,o=t.length;r<o;r+=4096)n.push(u.apply(null,t.subarray(r,r+4096)));return et(n.join(""))};var Rt=t=>{if(t.length<2){var e=t.charCodeAt(0);return e<128?t:e<2048?u(192|e>>>6)+u(128|e&63):u(224|e>>>12&15)+u(128|e>>>6&63)+u(128|e&63)}else{var e=65536+(t.charCodeAt(0)-55296)*1024+(t.charCodeAt(1)-56320);return u(240|e>>>18&7)+u(128|e>>>12&63)+u(128|e>>>6&63)+u(128|e&63)}},Bt=/[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g,Ft=t=>t.replace(Bt,Rt),W=f?t=>Buffer.from(t,"utf8").toString("base64"):X?t=>Dt(X.encode(t)):t=>et(Ft(t)),b=(t,e=!1)=>e?Tt(W(t)):W(t);var Pt=/[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g,Lt=t=>{switch(t.length){case 4:var e=(7&t.charCodeAt(0))<<18|(63&t.charCodeAt(1))<<12|(63&t.charCodeAt(2))<<6|63&t.charCodeAt(3),n=e-65536;return u((n>>>10)+55296)+u((n&1023)+56320);case 3:return u((15&t.charCodeAt(0))<<12|(63&t.charCodeAt(1))<<6|63&t.charCodeAt(2));default:return u((31&t.charCodeAt(0))<<6|63&t.charCodeAt(1))}},Nt=t=>t.replace(Pt,Lt),Ot=t=>{if(t=t.replace(/\s+/g,""),!Et.test(t))throw new TypeError("malformed base64.");t+="==".slice(2-(t.length&3));let e,n="",r,o;for(let i=0;i<t.length;)e=C[t.charAt(i++)]<<18|C[t.charAt(i++)]<<12|(r=C[t.charAt(i++)])<<6|(o=C[t.charAt(i++)]),n+=r===64?u(e>>16&255):o===64?u(e>>16&255,e>>8&255):u(e>>16&255,e>>8&255,e&255);return n},nt=typeof atob=="function"?t=>atob(tt(t)):f?t=>Buffer.from(t,"base64").toString("binary"):Ot,Vt=f?t=>Q(Buffer.from(t,"base64")):t=>Q(nt(t).split("").map(e=>e.charCodeAt(0)));var kt=f?t=>Buffer.from(t,"base64").toString("utf8"):J?t=>J.decode(Vt(t)):t=>Nt(nt(t)),Kt=t=>tt(t.replace(/[-_]/g,e=>e=="-"?"+":"/")),rt=t=>kt(Kt(t));var k="test";function K(t){return b(JSON.stringify(t))}function ot(t){return JSON.parse(rt(t))}function it(){try{return localStorage.setItem(k,k),localStorage.removeItem(k),!0}catch(t){return!1}}var M=class{constructor(e){this.get=e=>{let n=this.retrieveValue(this.buildKey(e));return n?ot(n):null};this.set=(e,n)=>{this.storeValue(this.buildKey(e),K(n))};this.buildKey=e=>K(`${this._writeKey}_${e}`);this._writeKey=e}},E=M;var T=class extends E{retrieveValue(e){var n;return(n=V.get(e))!=null?n:null}storeValue(e,n){V.set(e,n)}};var w=class extends E{constructor(n){super(n);this.retrieveValue=n=>this._localStorageAvailable?localStorage.getItem(n):null;this.storeValue=(n,r)=>{this._localStorageAvailable&&localStorage.setItem(n,r)};this._localStorageAvailable=it()}};var st="anonymousUserId",D=class{constructor(e){this.getOrCreateAnonymousUserId=()=>{if(this._anonymousUserId)return this._anonymousUserId;let e=this.getAnonymousUserId()||this.createAnonymousUserId();return this._anonymousUserId=e,e};this.getAnonymousUserId=()=>this._storageService.get(st);this.createAnonymousUserId=()=>{let e=g();return this._storageService.set(st,e),e};this._storageService=new T(e),this._anonymousUserId=null}};var at="clientSession",ut=30,R=class{constructor(e){this.getOrCreateSession=()=>this.getAndUpdateSession()||this.createSession();this.getAndUpdateSession=()=>{let e=this._currentSession||this.getStoredSession();if(!e)return;if(e.expiration>new Date().getTime())return this.updateSessionExpiration(e)};this.createSession=(e=ut)=>{let n=d({sessionId:g(),startTime:new Date,expiration:F(e),initial:x()},v());return this._currentSession=n,this.setStoredSession(n),n};this.updateSessionExpiration=(e,n=ut)=>{let r=y(d({},e),{expiration:F(n)});return this._currentSession=r,this.setStoredSession(r),r};this.getStoredSession=()=>this._storageService.get(at);this.setStoredSession=e=>{this._storageService.set(at,e)};this._writeKey=e,this._storageService=new w(this._writeKey),this._currentSession=null}};var j=class{constructor(e){this.post=(e,n)=>{let r=JSON.stringify(n),o=this.getAuthString(this._writeKey);if(fetch)fetch(e,{method:"POST",body:r,credentials:"include",headers:{"Content-type":"application/json; charset=UTF-8",Authorization:this.getAuthString(this._writeKey)},keepalive:!0}).catch(()=>{});else{let i=new XMLHttpRequest;i.open("POST",e,!0),i.setRequestHeader("Content-type","application/json; charset=UTF-8"),i.setRequestHeader("Authorization",o),i.send(r)}};this._writeKey=e}getAuthString(e){return`Basic ${b(e+":")}`}},ct=j;var z=class{constructor(e){this.startAutoIdentify=()=>{this._autoIdentify=!0,this.refreshMonitoredInputs(),setInterval(this.refreshMonitoredInputs,2e3)};this.stopAutoIdentify=()=>{this._monitoredInputs.forEach(e=>{e.isConnected&&(e.removeEventListener("blur",this.handleInputBlur),e.removeEventListener("keydown",this.handleInputKeydown))}),this._monitoredInputs.clear(),this._autoIdentify=!1};this.refreshMonitoredInputs=()=>{if(!this._autoIdentify)return;this._monitoredInputs.forEach(n=>{n.isConnected||this._monitoredInputs.delete(n)}),Array.from(document.getElementsByTagName("input")).filter(n=>!this._monitoredInputs.has(n)&&this.isCandidateIdentityInput(n)).forEach(n=>{n.addEventListener("blur",this.handleInputBlur),n.addEventListener("keydown",this.handleInputKeydown),this._monitoredInputs.add(n)})};this.handleInputBlur=e=>{this._autoIdentify&&this.maybeIdentifyInputEmail(e)};this.handleInputKeydown=e=>{this._autoIdentify&&e.key==="Enter"&&this.maybeIdentifyInputEmail(e)};this.maybeIdentifyInputEmail=e=>{var r;if(!this._autoIdentify||!(e.target instanceof HTMLInputElement))return;let n=(r=e.target)==null?void 0:r.value;if(n){if(!_(n)||this._submittedEmails.has(n))return;new l(this._intentContext,{email:n}).track(),this._submittedEmails.add(n)}};this.__getMonitoredInputs=()=>this._monitoredInputs;this.__getSubmittedEmails=()=>this._submittedEmails;this._intentContext=e,this._monitoredInputs=new Set,this._submittedEmails=new Set,this._autoIdentify=!1}isCandidateIdentityInput(e){return e.type==="email"||e.type==="text"}},Y=z;var Mt={autoIdentify:!1},H=class{constructor(e,n=Mt){this.page=()=>{new A(this._context).track()};this.identify=e=>{let n=_(e);return n?(new l(this._context,{email:n}).track(),!0):!1};this.startAutoIdentify=()=>{this._intentAgent||(this._intentAgent=new Y(this._context)),this._intentAgent.startAutoIdentify()};this.stopAutoIdentify=()=>{var e;(e=this._intentAgent)==null||e.stopAutoIdentify()};let r=new ct(e),o=new R(e);o.getOrCreateSession();let i=new D(e);i.getOrCreateAnonymousUserId(),this._context={writeKey:e,clientConfig:n,apiClient:r,sessionManager:o,identityManager:i},n.autoIdentify&&(this._intentAgent=new Y(this._context),this._intentAgent.startAutoIdentify())}},dt=H;var pt=dt;var jt=function(){var r;let t=document.getElementById("unifytag"),e=(r=t==null?void 0:t.getAttribute("data-write-key"))!=null?r:t==null?void 0:t.getAttribute("data-api-key");if(!e)return;new pt(e,{autoIdentify:!0}).page()};jt();})();
/*! Bundled license information:

js-cookie/dist/js.cookie.mjs:
  (*! js-cookie v3.0.5 | MIT *)
*/
