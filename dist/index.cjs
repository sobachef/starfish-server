var e=require("body-parser"),t=require("connect-timeout"),n=require("cors"),r=require("crypto"),o=require("express"),s=require("fs"),i=require("nedb"),u=require("path"),c=require("url"),a=require("bitcore-lib");function f(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}function d(e){if(e&&e.__esModule)return e;var t=Object.create(null);return e&&Object.keys(e).forEach(function(n){if("default"!==n){var r=Object.getOwnPropertyDescriptor(e,n);Object.defineProperty(t,n,r.get?r:{enumerable:!0,get:function(){return e[n]}})}}),t.default=e,t}var h=/*#__PURE__*/f(e),l=/*#__PURE__*/f(t),v=/*#__PURE__*/f(n),m=/*#__PURE__*/f(r),p=/*#__PURE__*/f(o),g=/*#__PURE__*/f(s),P=/*#__PURE__*/f(i),S=/*#__PURE__*/f(u),y=/*#__PURE__*/f(a);function T(){return T=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},T.apply(this,arguments)}var O=/*#__PURE__*/function(){function e(e){this.db=new e.Datastore({filename:e.db+"/keys.db",autoload:!0}),this.wallet=e.wallet,this.config=e}var t=e.prototype;return t.setSeed=function(e){this.seed=e},t.getSeed=function(){return this.seed},t.sign=function(e){return this.wallet.sign(e.message,e.key,e.encoding)},t.encrypt=function(e){return this.wallet.encrypt(e.message,e.key)},t.findOrCreate=function(e){try{var t=this;return Promise.resolve(t.findOne(e)).then(function(n){var r,o=function(){if(!n)return Promise.resolve(t.count({})).then(function(o){return t.seed?Promise.resolve(t.wallet.create(t.seed,o,e)).then(function(e){return n=e,Promise.resolve(t.insert(n)).then(function(e){n=e})}):(console.log("Please go to http://localhost:21000 and create a wallet"),r=1,null)})}();return o&&o.then?o.then(function(e){return r?e:n}):r?o:n})}catch(e){return Promise.reject(e)}},t.findOne=function(e){var t=this;return new Promise(function(n,r){t.db.findOne(e,function(e,r){n(r?t.transform(r):null)})})},t.find=function(e){var t=this;return new Promise(function(n,r){t.db.find(e,function(e,r){n(r.map(function(e){return t.transform(e)}))})})},t.count=function(e){var t=this;return new Promise(function(n,r){t.db.count(e,function(e,t){n(t)})})},t.insert=function(e){var t=this;return new Promise(function(n,r){t.db.insert(e,function(r,o){n(t.transform(e))})})},t.transform=function(e){var t=this.wallet.derive(this.seed,e.path);return e.priv=t.privateKey.toString(),e.pub=t.publicKey.toString(),e.address=t.publicKey.toAddress().toString(),e},t.all=function(){var e=this;return new Promise(function(t,n){e.db.find({},function(n,r){t(r.map(function(t){return e.transform(t)}))})})},e}();function b(e,t,n){var r=m.default.randomBytes(16);n||(n=m.default.createHash("sha256").update(t).digest());var o=m.default.createCipheriv("aes-256-cbc",n,r),s=o.update(e);return s=Buffer.concat([s,o.final()]),{iv:r.toString("hex"),encryptedData:s.toString("hex")}}var j=/*#__PURE__*/function(){function e(e){this.db=new e.Datastore({filename:e.db+"/seed.db",autoload:!0}),this.wallet=e.wallet}var t=e.prototype;return t.get=function(e){var t=this;return new Promise(function(n,r){t.db.findOne({},function(r,o){if(o)try{var s=function(e,t,n){var r=Buffer.from(e.iv,"hex");n||(n=m.default.createHash("sha256").update(t).digest());var o=Buffer.from(e.encryptedData,"hex"),s=m.default.createDecipheriv("aes-256-cbc",n,r),i=s.update(o);return(i=Buffer.concat([i,s.final()])).toString()}(o.hex,e),i=t.wallet.seed(s);n(i)}catch(e){n(null)}else n(null)})})},t.importKey=function(e,t){var n=this;return new Promise(function(r,o){try{var s=n.wallet.seed(e);n.db.insert({hex:b(s.hex,t)},function(e,t){r(s)})}catch(e){o(e)}})},t.exportKey=function(e){try{return Promise.resolve(this.get(e)).then(function(e){return e.hex})}catch(e){return Promise.reject(e)}},t.count=function(){var e=this;return new Promise(function(t,n){e.db.count({},function(e,n){t(n)})})},t.create=function(e){var t=this;return new Promise(function(n,r){var o=t.wallet.seed();t.db.insert({hex:b(o.hex,e)},function(e,t){n(o)})})},e}(),w=/*#__PURE__*/function(){function e(e){this.db=new e.Datastore({filename:e.db+"/state.db",autoload:!0})}var t=e.prototype;return t.setState=function(e){this.state=e},t.getState=function(){return this.state},t.findOrCreate=function(e){try{var t=this;return Promise.resolve(t.findOne({host:e.host})).then(function(n){var r=function(){if(!n)return Promise.resolve(t.insert(e)).then(function(e){n=e})}();return r&&r.then?r.then(function(){return n}):n})}catch(e){return Promise.reject(e)}},t.findOne=function(e){var t=this;return new Promise(function(n,r){t.db.findOne(e,function(e,t){t?(delete t._id,n(t)):n(null)})})},t.find=function(e){var t=this;return new Promise(function(n,r){t.db.find(e,function(e,t){n(t)})})},t.delete=function(e){var t=this;return new Promise(function(n,r){t.db.remove(e,function(e,t){n(t)})})},t.count=function(e){var t=this;return new Promise(function(n,r){t.db.count(e,function(e,t){n(t)})})},t.insert=function(e){var t=this;return new Promise(function(n,r){t.db.insert(e,function(r,o){t.setState(e),n(e)})})},t.update=function(e){var t=this;return new Promise(function(n,r){t.db.update({host:e.host},{$set:e},{upsert:!0,returnUpdatedDocs:!0},function(e,r,o){console.log("UPDATED",{err:e,accessToken:o.accessToken}),t.setState(o),n(o)})})},t.all=function(){var e=this;return new Promise(function(t,n){e.db.find({},function(e,n){t(n)})})},e}(),A=y.default.deps._,K=y.default.PrivateKey,_=y.default.PublicKey,k=y.default.Address,E=y.default.encoding.BufferWriter,R=y.default.crypto.ECDSA,N=y.default.crypto.Signature,x=y.default.crypto.Hash.sha256sha256,U=y.default.util.js,H=y.default.util.preconditions,L=function e(t,n){return void 0===n&&(n="utf8"),this instanceof e?(H.checkArgument(A.isString(t),"First argument should be a string. You can specify the encoding as the second parameter"),H.checkArgument(["ascii","utf8","utf16le","ucs2","base64","latin1","binary","hex"].includes(n),"Second argument should be a valid BufferEncoding: 'utf8', 'hex', or 'base64', etc"),this.message=t,this.encoding=n,this):new e(t,n)};L.MAGIC_BYTES=Buffer.from("Bitcoin Signed Message:\n"),L.prototype.magicHash=function(){var e=E.varintBufNum(L.MAGIC_BYTES.length),t=Buffer.from(this.message,this.encoding),n=E.varintBufNum(t.length),r=Buffer.concat([e,L.MAGIC_BYTES,n,t]);return x(r)},L.prototype._sign=function(e){H.checkArgument(e instanceof K,"First argument should be an instance of PrivateKey");var t=this.magicHash(),n=new R;return n.hashbuf=t,n.privkey=e,n.pubkey=e.toPublicKey(),n.signRandomK(),n.calci(),n.sig},L.prototype.sign=function(e){var t=e.toWIF();return e=K.fromWIF(t),this._sign(e).toCompact().toString("base64")},L.prototype._verify=function(e,t){H.checkArgument(e instanceof _,"First argument should be an instance of PublicKey"),H.checkArgument(t instanceof N,"Second argument should be an instance of Signature");var n=this.magicHash(),r=R.verify(n,t,e);return r||(this.error="The signature was invalid"),r},L.prototype.verify=function(e,t){H.checkArgument(e),H.checkArgument(t&&A.isString(t)),A.isString(e)&&(e=k.fromString(e));var n=N.fromCompact(Buffer.from(t,"base64")),r=new R;r.hashbuf=this.magicHash(),r.sig=n;var o=r.toPublicKey(),s=k.fromPublicKey(o,e.network);return e.toString()!==s.toString()?(this.error="The signature did not match the message digest",!1):this._verify(o,n)},L.fromString=function(e){return new L(e)},L.fromJSON=function(e){return U.isValidJSON(e)&&(e=JSON.parse(e)),new L(e.message)},L.prototype.toObject=function(){return{message:this.message,encoding:this.encoding}},L.prototype.toJSON=function(){return JSON.stringify(this.toObject())},L.prototype.toString=function(){return this.message},L.prototype.inspect=function(){return"<Message: "+this.toString()+">"},delete global._bitcore;var D=function(e,t,n){var r=y.default.PrivateKey.fromWIF(t.priv),o=L(e,n);return{address:t.address,message:e,sig:o.sign(r),ts:Date.now()}},C={__proto__:null,sign:D,encrypt:function(e,t){var n=b(e,null,y.default.PrivateKey.fromWIF(t.priv).toBuffer());return{address:t.address,data:n,ts:Date.now()}},create:function(e,t,n){try{var r="m/44'/0'/"+t+"'/2/0",o=e.key.deriveChild(r),s=o.privateKey.toAddress().toString(),i={path:r,pub:o.publicKey.toString(),address:s,host:n.host};return Promise.resolve(i)}catch(e){return Promise.reject(e)}},seed:function(e){var t=e?Buffer.from(e,"hex"):y.default.crypto.Random.getRandomBuffer(64);try{var n=y.default.HDPrivateKey.fromSeed(t);return{hex:t.toString("hex"),key:n}}catch(e){throw console.log("error",e),e}},derive:function(e,t){return e.key.deriveChild(t)},verify:function(e,t,n,r){return L(e,r).verify(t,n)}};function q(e,t){try{var n=e()}catch(e){return t(e)}return n&&n.then?n.then(void 0,t):n}var B=function(e){try{return Promise.resolve(Promise.resolve().then(function(){/*#__PURE__*/return d(require("minidenticons"))})).then(function(t){return t.minidenticon(e)})}catch(e){return Promise.reject(e)}},I=c.fileURLToPath("undefined"==typeof document?new(require("url").URL)("file:"+__filename).href:document.currentScript&&document.currentScript.src||new URL("index.cjs",document.baseURI).href),M=u.dirname(I),F=p.default(),z=["http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")],G=process.env.TOKENPASS_ORIGIN_WHITELIST;G&&z.push.apply(z,G.split(","));var J=function(e){return e.origin?new URL(e.origin).host:null};exports.init=function(e){var t=e.db;g.default.existsSync(t)||g.default.mkdirSync(t,{recursive:!0});var n=new j({db:t,wallet:C,Datastore:P.default}),o=new O({db:t,wallet:C,Datastore:P.default}),s=new w({db:t,Datastore:P.default});F.set("views",S.default.join(M,"views")),F.set("view engine","ejs"),F.use(l.default("20s")),F.use(h.default.json({limit:"50mb"})),F.use(h.default.raw({type:"application/octet-stream",limit:"50mb"})),F.use(h.default.urlencoded({limit:"50mb",extended:!0})),F.use(p.default.static(S.default.join(M,"public"))),F.options("*",v.default()),F.use(p.default.urlencoded({extended:!1})),F.post("/sign",v.default(),function(e,t){try{consolg.log("SIGN ATTEMPTED FROM",e.headers.origin,{message:e.body.message,authToken:e.headers.authorization});var n=e.body.message,r=e.body.encoding||"utf8";return Promise.resolve(function(){if(o.getSeed()){var i=e.headers.authorization;return void 0===i|null===i?void t.status(401).json({error:"Please provide an access token in the Authorization header.",code:2,success:!1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth"}):Promise.resolve(s.findOne({accessToken:i})).then(function(s){if(null!=s&&s.accessToken&&s.accessToken===i){var u=i?s.host:J(e.headers);u||(u=process.env.TOKENPASS_HOST||"localhost",console.log("no origin, using",u));var c=s.expireTime&&s.expireTime<Date.now();if(console.log("SIGN:",{expireTime:s.expireTime,now:Date.now(),host:u}),!c)return Promise.resolve(o.findOrCreate({host:u})).then(function(e){if(e)return Promise.resolve(o.sign({message:n,key:e,encoding:r,ts:Date.now()})).then(function(e){t.status(200).json(e)});t.status(417).json({error:"please create a wallet.",success:!1})});t.status(401).json({error:"Access token has expired.",errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",code:5})}else t.status(401).json({error:"Invalid access token.",errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",code:3,success:!1})})}t.status(401).json({errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",error:"Check that TokenPass is running and you're signed in.",code:1})}())}catch(e){return Promise.reject(e)}}),F.post("/encrypt",v.default(),function(e,t){try{var n=e.body.message;return Promise.resolve(function(){if(o.getSeed()){var r=e.headers.authorization;return void 0===r|null===r?void t.status(401).json({error:"Please provide an access token in the Authorization header.",code:2,success:!1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth"}):(J(e.headers),Promise.resolve(s.findOne({accessToken:r})).then(function(e){if(e)return Promise.resolve(o.findOrCreate({host:e.host})).then(function(e){if(e){var r=o.encrypt({message:n,key:e}),s=r.address,i=r.data,u=r.sig,c=r.ts;console.log({address:s,data:i,sig:u,ts:c}),t.status(200).json({data:i,address:s,sig:u,ts:c})}else t.status(417).json({error:"please create a wallet."})});t.status(401).json({error:"Invalid access token.",errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",code:3,success:!1})}))}t.status(401).json({errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",error:"Check that TokenPass is running and you're signed in.",code:1})}())}catch(e){return Promise.reject(e)}}),F.post("/register",function(e,t){try{return Promise.resolve(n.create(e.body.password)).then(function(e){return o.setSeed(e),Promise.resolve(s.findOrCreate({host:process.env.TOKENPASS_HOST||"localhost"})).then(function(e){function n(){t.json({})}var r=function(){if(!e.icon)return e.icon="/auth/icon",Promise.resolve(s.update(e)).then(function(){})}();return r&&r.then?r.then(n):n()})})}catch(e){return Promise.reject(e)}}),F.post("/import",function(e,t){try{var r=q(function(){return Promise.resolve(n.importKey(e.body.hex,e.body.password)).then(function(e){o.setSeed(e),t.json({})})},function(){t.json({error:"invalid seed",success:!1})});return Promise.resolve(r&&r.then?r.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),F.post("/export",function(e,t){try{var r=q(function(){return Promise.resolve(n.exportKey(e.body.password)).then(function(e){e?t.json({seed:e}):t.status(401).json({error:"invalid",success:!1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth"})})},function(){});return Promise.resolve(r&&r.then?r.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),F.post("/state",v.default(),function(e,t){try{var n=new URL(e.headers.origin).host;return Promise.resolve(s.findOne({host:n})).then(function(r){function o(){t.json({success:!0})}var i=function(){if(r){var t=function(){if("clear"===e.query.mode)return Promise.resolve(s.delete({host:n})).then(function(){return Promise.resolve(s.update(T({},e.body,{host:n}))).then(function(){})});s.update(T({},e.body,{host:n}))}();if(t&&t.then)return t.then(function(){})}else s.insert(T({},e.body,{host:n}))}();return i&&i.then?i.then(o):o()})}catch(e){return Promise.reject(e)}}),F.post("/profile",v.default(),function(e,t){try{var n=function(){if(o.getSeed()){var n="global",r=q(function(){return Promise.resolve(s.findOne({host:n})).then(function(r){function o(){t.json({success:!0})}var i=T({},e.body,{host:n}),u=function(){if(r){var t=function(){s.update(i)},o=function(){if("clear"===e.query.mode)return Promise.resolve(s.delete({host:n})).then(function(){})}();return o&&o.then?o.then(t):t()}s.insert(i)}();return u&&u.then?u.then(o):o()})},function(e){console.error(e),t.status(500).json({success:!1,error:e.toString()})});if(r&&r.then)return r.then(function(){})}else t.status(401).json({error:"please check that TokenPass is running and you're signed in. check TokenPass dashboard at http://localhost:21000",code:1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")})}();return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),F.delete("/state",v.default(),function(e,t){try{var n=new URL(e.headers.origin).host;return s.delete(T({},e.body,{host:n})),t.json({success:!0}),Promise.resolve()}catch(e){return Promise.reject(e)}}),F.get("/profile",v.default(),function(e,t){try{return Promise.resolve(s.findOne({host:"global"})).then(function(e){t.json(e)})}catch(e){return Promise.reject(e)}}),F.get("/state",v.default(),function(e,t){try{var n=new URL(e.headers.origin).host;return Promise.resolve(s.findOne({host:n})).then(function(e){t.json(e)})}catch(e){return Promise.reject(e)}}),F.post("/login",function(e,t){try{var r=q(function(){return Promise.resolve(n.get(e.body.password)).then(function(e){e?(o.setSeed(e),t.json({success:!0})):t.json({error:"invalid",success:!1})})},function(){});return Promise.resolve(r&&r.then?r.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),F.post("/logout",v.default(),function(e,t){o.setSeed(null),t.json({success:!0})}),F.post("/fund",v.default(),function(e,t){try{var n=o.getSeed();return Promise.resolve(function(){if(n){var r="http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/fund",o=e.headers.origin,i=o?new URL(o).host:"localhost";return Promise.resolve(s.findOne({host:i})).then(function(n){var o;if(null!=(o=n.scopes)&&o.includes("fund")){var s=n.accessToken,u=e.body.rawtx,c=q(function(){return Promise.resolve(fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rawtx:u,broadcast:!0,sigma:!0,host:i,authToken:s})})).then(function(e){return Promise.resolve(e.json()).then(function(e){t.json(e)})})},function(e){console.error(e),t.status(500).json({success:!1,error:e.toString()})});return c&&c.then?c.then(function(){}):void 0}t.status(403).json({error:"Insufficient permission",code:7})})}t.status(401).json({error:"please check that TokenPass is running and you're signed in. check TokenPass dashboard at http://localhost:21000",code:1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth"})}())}catch(e){return Promise.reject(e)}}),F.post("/login",function(e,t){try{var r=q(function(){return Promise.resolve(n.get(e.body.password)).then(function(e){e?(o.setSeed(e),t.json({success:!0})):t.json({error:"invalid",success:!1})})},function(){});return Promise.resolve(r&&r.then?r.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),F.post("/auth",v.default(),function(e,t){try{console.log("ATH ATTEMPTED FROM",e.headers.origin);var i=e.body.password;return Promise.resolve(q(function(){return Promise.resolve(n.get(i)).then(function(n){return function(){if(n){var i;if(o.setSeed(n),e.headers.origin&&!z.includes(e.headers.origin))return void t.status(403).json({error:"The origin is not authorized",code:6});var u=e.body.host;console.log({hosts:u,origin:e.headers.origin});var c=function(e){switch(e){case"forever":return 0;case"once":return 1e4;case"1h":return 36e5;case"1d":return 864e5;case"1w":return 6048e5;case"1m":return 2592e6;default:return"once"}}(e.body.expire),a=r.randomUUID(),f=(null==(i=e.body.scopes)?void 0:i.split(","))||[],d={host:u,accessToken:a,scopes:f,icon:e.body.icon,expireTime:Date.now()+c};return Promise.resolve(s.update(d)).then(function(){t.json({success:!0,accessToken:a,expireTime:c,host:u})})}t.json({error:"invalid",success:!1})}()})},function(e){t.status(500).json({success:!1,error:e.toString()})}))}catch(e){return Promise.reject(e)}}),F.get("/prove",function(e,t){try{new URL(e.headers.origin);var n=e.query.message;return Promise.resolve((void 0)(e.query.txid)).then(function(e){if(e){var r=D(n,e);return t.json({message:r.message,key:e,address:r.address,sig:r.sig,ts:r.ts})}t.status(404).json({error:"txid not found",code:4})})}catch(e){return Promise.reject(e)}}),F.get("/auth",function(e,t){try{var n,r=new URL(e.query.returnURL).host,o=J(e.headers)||process.env.TOKENPASS_HOST||"localhost";if(o!==r)return t.status(403).json({error:"The origin is not authorized "+o+" "+r,code:6}),Promise.resolve();var s=e.query.returnURL,i=e.query.icon,u=(null==(n=e.query.scopes)?void 0:n.split(","))||[];return console.log("AUTH GET:",{returnURL:s,icon:i}),t.render("auth",{returnURL:s,icon:i,scopes:u,host:o||"lostlhost"}),Promise.resolve()}catch(e){return Promise.reject(e)}}),F.get("/auth/icon",v.default(),function(e,t){try{if(e.headers.host!==(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000"))return t.status(403).json({error:"The origin is not authorized"+e.headers.origin,code:6}),Promise.resolve();t.set("Content-Type","image/svg+xml"),t.set("Cache-Control","max-age=31536000");var n=function(){if(o.getSeed())return Promise.resolve(o.findOrCreate({host:"localhost"})).then(function(e){t.send(B(e.pub))});t.send(B("Anon"))}();return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),F.get("/",function(e,t){try{var r=o.getSeed()?Promise.resolve(o.all()).then(function(e){return Promise.resolve(s.all()).then(function(n){t.render("home",{keys:e,states:n,seed:!0})})}):Promise.resolve(n.count()).then(function(n){if(n){var r=J(e.headers);t.render("login",{host:r})}else t.render("home",{seed:!1})});return Promise.resolve(r&&r.then?r.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),F.listen(process.env.TOKENPASS_PORT||21e3,function(){console.log("TokenPass listening at http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000"))})};
//# sourceMappingURL=index.cjs.map
