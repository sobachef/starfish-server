import e from"body-parser";import t from"connect-timeout";import n from"cors";import r,{randomUUID as o}from"crypto";import s from"express";import i from"fs";import c from"nedb";import u,{dirname as a}from"path";import{fileURLToPath as h}from"url";import f from"bitcore-lib";function d(){return d=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},d.apply(this,arguments)}var l=/*#__PURE__*/function(){function e(e){this.db=new e.Datastore({filename:e.db+"/keys.db",autoload:!0}),this.wallet=e.wallet,this.config=e}var t=e.prototype;return t.setSeed=function(e){this.seed=e},t.getSeed=function(){return this.seed},t.sign=function(e){return this.wallet.sign(e.message,e.key,e.encoding)},t.encrypt=function(e){return this.wallet.encrypt(e.message,e.key)},t.findOrCreate=function(e){try{var t=this;return Promise.resolve(t.findOne(e)).then(function(n){var r,o=function(){if(!n)return Promise.resolve(t.count({})).then(function(o){return t.seed?Promise.resolve(t.wallet.create(t.seed,o,e)).then(function(e){return n=e,Promise.resolve(t.insert(n)).then(function(e){n=e})}):(console.log("Please go to http://localhost:21000 and create a wallet"),r=1,null)})}();return o&&o.then?o.then(function(e){return r?e:n}):r?o:n})}catch(e){return Promise.reject(e)}},t.findOne=function(e){var t=this;return new Promise(function(n,r){t.db.findOne(e,function(e,r){n(r?t.transform(r):null)})})},t.find=function(e){var t=this;return new Promise(function(n,r){t.db.find(e,function(e,r){n(r.map(function(e){return t.transform(e)}))})})},t.count=function(e){var t=this;return new Promise(function(n,r){t.db.count(e,function(e,t){n(t)})})},t.insert=function(e){var t=this;return new Promise(function(n,r){t.db.insert(e,function(r,o){n(t.transform(e))})})},t.transform=function(e){var t=this.wallet.derive(this.seed,e.path);return e.priv=t.privateKey.toString(),e.pub=t.publicKey.toString(),e.address=t.publicKey.toAddress().toString(),e},t.all=function(){var e=this;return new Promise(function(t,n){e.db.find({},function(n,r){t(r.map(function(t){return e.transform(t)}))})})},e}();function v(e,t,n){var o=r.randomBytes(16);n||(n=r.createHash("sha256").update(t).digest());var s=r.createCipheriv("aes-256-cbc",n,o),i=s.update(e);return i=Buffer.concat([i,s.final()]),{iv:o.toString("hex"),encryptedData:i.toString("hex")}}var m=/*#__PURE__*/function(){function e(e){this.db=new e.Datastore({filename:e.db+"/seed.db",autoload:!0}),this.wallet=e.wallet}var t=e.prototype;return t.get=function(e){var t=this;return new Promise(function(n,o){t.db.findOne({},function(o,s){if(s)try{var i=function(e,t,n){var o=Buffer.from(e.iv,"hex");n||(n=r.createHash("sha256").update(t).digest());var s=Buffer.from(e.encryptedData,"hex"),i=r.createDecipheriv("aes-256-cbc",n,o),c=i.update(s);return(c=Buffer.concat([c,i.final()])).toString()}(s.hex,e),c=t.wallet.seed(i);n(c)}catch(e){n(null)}else n(null)})})},t.importKey=function(e,t){var n=this;return new Promise(function(r,o){try{var s=n.wallet.seed(e);n.db.insert({hex:v(s.hex,t)},function(e,t){r(s)})}catch(e){o(e)}})},t.exportKey=function(e){try{return Promise.resolve(this.get(e)).then(function(e){return e.hex})}catch(e){return Promise.reject(e)}},t.count=function(){var e=this;return new Promise(function(t,n){e.db.count({},function(e,n){t(n)})})},t.create=function(e){var t=this;return new Promise(function(n,r){var o=t.wallet.seed();t.db.insert({hex:v(o.hex,e)},function(e,t){n(o)})})},e}(),p=/*#__PURE__*/function(){function e(e){this.db=new e.Datastore({filename:e.db+"/state.db",autoload:!0})}var t=e.prototype;return t.setState=function(e){this.state=e},t.getState=function(){return this.state},t.findOrCreate=function(e){try{var t=this;return Promise.resolve(t.findOne({host:e.host})).then(function(n){var r=function(){if(!n)return Promise.resolve(t.insert(e)).then(function(e){n=e})}();return r&&r.then?r.then(function(){return n}):n})}catch(e){return Promise.reject(e)}},t.findOne=function(e){var t=this;return new Promise(function(n,r){t.db.findOne(e,function(e,t){t?(delete t._id,n(t)):n(null)})})},t.find=function(e){var t=this;return new Promise(function(n,r){t.db.find(e,function(e,t){n(t)})})},t.delete=function(e){var t=this;return new Promise(function(n,r){t.db.remove(e,function(e,t){n(t)})})},t.count=function(e){var t=this;return new Promise(function(n,r){t.db.count(e,function(e,t){n(t)})})},t.insert=function(e){var t=this;return new Promise(function(n,r){t.db.insert(e,function(r,o){t.setState(e),n(e)})})},t.update=function(e){var t=this;return new Promise(function(n,r){t.db.update({host:e.host},{$set:e},{upsert:!0,returnUpdatedDocs:!0},function(e,r,o){console.log("UPDATED",{err:e,accessToken:o.accessToken}),t.setState(o),n(o)})})},t.all=function(){var e=this;return new Promise(function(t,n){e.db.find({},function(e,n){t(n)})})},e}(),g=f.deps._,P=f.PrivateKey,S=f.PublicKey,y=f.Address,T=f.encoding.BufferWriter,O=f.crypto.ECDSA,b=f.crypto.Signature,j=f.crypto.Hash.sha256sha256,w=f.util.js,A=f.util.preconditions,K=function e(t,n){return void 0===n&&(n="utf8"),this instanceof e?(A.checkArgument(g.isString(t),"First argument should be a string. You can specify the encoding as the second parameter"),A.checkArgument(["ascii","utf8","utf16le","ucs2","base64","latin1","binary","hex"].includes(n),"Second argument should be a valid BufferEncoding: 'utf8', 'hex', or 'base64', etc"),this.message=t,this.encoding=n,this):new e(t,n)};K.MAGIC_BYTES=Buffer.from("Bitcoin Signed Message:\n"),K.prototype.magicHash=function(){var e=T.varintBufNum(K.MAGIC_BYTES.length),t=Buffer.from(this.message,this.encoding),n=T.varintBufNum(t.length),r=Buffer.concat([e,K.MAGIC_BYTES,n,t]);return j(r)},K.prototype._sign=function(e){A.checkArgument(e instanceof P,"First argument should be an instance of PrivateKey");var t=this.magicHash(),n=new O;return n.hashbuf=t,n.privkey=e,n.pubkey=e.toPublicKey(),n.signRandomK(),n.calci(),n.sig},K.prototype.sign=function(e){var t=e.toWIF();return e=P.fromWIF(t),this._sign(e).toCompact().toString("base64")},K.prototype._verify=function(e,t){A.checkArgument(e instanceof S,"First argument should be an instance of PublicKey"),A.checkArgument(t instanceof b,"Second argument should be an instance of Signature");var n=this.magicHash(),r=O.verify(n,t,e);return r||(this.error="The signature was invalid"),r},K.prototype.verify=function(e,t){A.checkArgument(e),A.checkArgument(t&&g.isString(t)),g.isString(e)&&(e=y.fromString(e));var n=b.fromCompact(Buffer.from(t,"base64")),r=new O;r.hashbuf=this.magicHash(),r.sig=n;var o=r.toPublicKey(),s=y.fromPublicKey(o,e.network);return e.toString()!==s.toString()?(this.error="The signature did not match the message digest",!1):this._verify(o,n)},K.fromString=function(e){return new K(e)},K.fromJSON=function(e){return w.isValidJSON(e)&&(e=JSON.parse(e)),new K(e.message)},K.prototype.toObject=function(){return{message:this.message,encoding:this.encoding}},K.prototype.toJSON=function(){return JSON.stringify(this.toObject())},K.prototype.toString=function(){return this.message},K.prototype.inspect=function(){return"<Message: "+this.toString()+">"},delete global._bitcore;var k=function(e,t,n){var r=f.PrivateKey.fromWIF(t.priv),o=K(e,n);return{address:t.address,message:e,sig:o.sign(r),ts:Date.now()}},_={__proto__:null,sign:k,encrypt:function(e,t){var n=v(e,null,f.PrivateKey.fromWIF(t.priv).toBuffer());return{address:t.address,data:n,ts:Date.now()}},create:function(e,t,n){try{var r="m/44'/0'/"+t+"'/2/0",o=e.key.deriveChild(r),s=o.privateKey.toAddress().toString(),i={path:r,pub:o.publicKey.toString(),address:s,host:n.host};return Promise.resolve(i)}catch(e){return Promise.reject(e)}},seed:function(e){var t=e?Buffer.from(e,"hex"):f.crypto.Random.getRandomBuffer(64);try{var n=f.HDPrivateKey.fromSeed(t);return{hex:t.toString("hex"),key:n}}catch(e){throw console.log("error",e),e}},derive:function(e,t){return e.key.deriveChild(t)},verify:function(e,t,n,r){return K(e,r).verify(t,n)}};function E(e,t){try{var n=e()}catch(e){return t(e)}return n&&n.then?n.then(void 0,t):n}var N=a(h(import.meta.url)),R=s(),x=["http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")],H=process.env.TOKENPASS_ORIGIN_WHITELIST;H&&x.push.apply(x,H.split(","));var U=function(e){return e.origin?new URL(e.origin).host:null},D=function(r){var a=r.db;i.existsSync(a)||i.mkdirSync(a,{recursive:!0});var h=new m({db:a,wallet:_,Datastore:c}),f=new l({db:a,wallet:_,Datastore:c}),v=new p({db:a,Datastore:c});R.set("views",u.join(N,"views")),R.set("view engine","ejs"),R.use(t("20s")),R.use(e.json({limit:"50mb"})),R.use(e.raw({type:"application/octet-stream",limit:"50mb"})),R.use(e.urlencoded({limit:"50mb",extended:!0})),R.use(s.static(u.join(N,"public"))),R.options("*",n()),R.use(s.urlencoded({extended:!1})),R.post("/sign",n(),function(e,t){try{console.log("SIGN ATTEMPTED FROM",e.headers.origin,{message:e.body.message,authToken:e.headers.authorization});var n=e.body.message,r=e.body.encoding||"utf8";return Promise.resolve(function(){if(f.getSeed()){var o=e.headers.authorization;return void 0===o|null===o?void t.status(401).json({error:"Please provide an access token in the Authorization header.",code:2,success:!1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth"}):Promise.resolve(v.findOne({accessToken:o})).then(function(s){if(null!=s&&s.accessToken&&s.accessToken===o){var i=o?s.host:U(e.headers);i||(i=process.env.TOKENPASS_HOST||"localhost",console.log("no origin, using",i));var c=s.expireTime&&s.expireTime<Date.now();if(console.log("SIGN:",{expireTime:s.expireTime,now:Date.now(),host:i}),!c)return Promise.resolve(f.findOrCreate({host:i})).then(function(e){if(e)return Promise.resolve(f.sign({message:n,key:e,encoding:r,ts:Date.now()})).then(function(e){t.status(200).json(e)});t.status(417).json({error:"please create a wallet.",success:!1})});t.status(401).json({error:"Access token has expired.",errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",code:5})}else t.status(401).json({error:"Invalid access token.",errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",code:3,success:!1})})}t.status(401).json({errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",error:"Check that TokenPass is running and you're signed in.",code:1})}())}catch(e){return Promise.reject(e)}}),R.post("/encrypt",n(),function(e,t){try{var n=e.body.message;return Promise.resolve(function(){if(f.getSeed()){var r=e.headers.authorization;return void 0===r|null===r?void t.status(401).json({error:"Please provide an access token in the Authorization header.",code:2,success:!1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth"}):(U(e.headers),Promise.resolve(v.findOne({accessToken:r})).then(function(e){if(e)return Promise.resolve(f.findOrCreate({host:e.host})).then(function(e){if(e){var r=f.encrypt({message:n,key:e}),o=r.address,s=r.data,i=r.sig,c=r.ts;console.log({address:o,data:s,sig:i,ts:c}),t.status(200).json({data:s,address:o,sig:i,ts:c})}else t.status(417).json({error:"please create a wallet."})});t.status(401).json({error:"Invalid access token.",errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",code:3,success:!1})}))}t.status(401).json({errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth",error:"Check that TokenPass is running and you're signed in.",code:1})}())}catch(e){return Promise.reject(e)}}),R.post("/register",function(e,t){try{return Promise.resolve(h.create(e.body.password)).then(function(e){return f.setSeed(e),Promise.resolve(v.findOrCreate({host:process.env.TOKENPASS_HOST||"localhost"})).then(function(e){function n(){t.json({})}var r=function(){if(!e.icon)return e.icon="/auth/icon",Promise.resolve(v.update(e)).then(function(){})}();return r&&r.then?r.then(n):n()})})}catch(e){return Promise.reject(e)}}),R.post("/import",function(e,t){try{var n=E(function(){return Promise.resolve(h.importKey(e.body.hex,e.body.password)).then(function(e){f.setSeed(e),t.json({})})},function(){t.json({error:"invalid seed",success:!1})});return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),R.post("/export",function(e,t){try{var n=E(function(){return Promise.resolve(h.exportKey(e.body.password)).then(function(e){e?t.json({seed:e}):t.status(401).json({error:"invalid",success:!1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth"})})},function(){});return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),R.post("/state",n(),function(e,t){try{var n=new URL(e.headers.origin).host;return Promise.resolve(v.findOne({host:n})).then(function(r){function o(){t.json({success:!0})}var s=function(){if(r){var t=function(){if("clear"===e.query.mode)return Promise.resolve(v.delete({host:n})).then(function(){return Promise.resolve(v.update(d({},e.body,{host:n}))).then(function(){})});v.update(d({},e.body,{host:n}))}();if(t&&t.then)return t.then(function(){})}else v.insert(d({},e.body,{host:n}))}();return s&&s.then?s.then(o):o()})}catch(e){return Promise.reject(e)}}),R.post("/profile",n(),function(e,t){try{var n=function(){if(f.getSeed()){var n="global",r=E(function(){return Promise.resolve(v.findOne({host:n})).then(function(r){function o(){t.json({success:!0})}var s=d({},e.body,{host:n}),i=function(){if(r){var t=function(){v.update(s)},o=function(){if("clear"===e.query.mode)return Promise.resolve(v.delete({host:n})).then(function(){})}();return o&&o.then?o.then(t):t()}v.insert(s)}();return i&&i.then?i.then(o):o()})},function(e){console.error(e),t.status(500).json({success:!1,error:e.toString()})});if(r&&r.then)return r.then(function(){})}else t.status(401).json({error:"please check that TokenPass is running and you're signed in. check TokenPass dashboard at http://localhost:21000",code:1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")})}();return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),R.delete("/state",n(),function(e,t){try{var n=new URL(e.headers.origin).host;return v.delete(d({},e.body,{host:n})),t.json({success:!0}),Promise.resolve()}catch(e){return Promise.reject(e)}}),R.get("/profile",n(),function(e,t){try{return Promise.resolve(v.findOne({host:"global"})).then(function(e){t.json(e)})}catch(e){return Promise.reject(e)}}),R.get("/state",n(),function(e,t){try{var n=new URL(e.headers.origin).host;return Promise.resolve(v.findOne({host:n})).then(function(e){t.json(e)})}catch(e){return Promise.reject(e)}}),R.post("/login",function(e,t){try{var n=E(function(){return Promise.resolve(h.get(e.body.password)).then(function(e){e?(f.setSeed(e),t.json({success:!0})):t.json({error:"invalid",success:!1})})},function(){});return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),R.post("/logout",n(),function(e,t){f.setSeed(null),t.json({success:!0})}),R.post("/fund",n(),function(e,t){try{var n=f.getSeed();return Promise.resolve(function(){if(n){var r="http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/fund",o=e.headers.origin,s=o?new URL(o).host:"localhost";return Promise.resolve(v.findOne({host:s})).then(function(n){var o;if(null!=(o=n.scopes)&&o.includes("fund")){var i=n.accessToken,c=e.body.rawtx,u=E(function(){return Promise.resolve(fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rawtx:c,broadcast:!0,sigma:!0,host:s,authToken:i})})).then(function(e){return Promise.resolve(e.json()).then(function(e){t.json(e)})})},function(e){console.error(e),t.status(500).json({success:!1,error:e.toString()})});return u&&u.then?u.then(function(){}):void 0}t.status(403).json({error:"Insufficient permission",code:7})})}t.status(401).json({error:"please check that TokenPass is running and you're signed in. check TokenPass dashboard at http://localhost:21000",code:1,errorURL:"http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000")+"/auth"})}())}catch(e){return Promise.reject(e)}}),R.post("/login",function(e,t){try{var n=E(function(){return Promise.resolve(h.get(e.body.password)).then(function(e){e?(f.setSeed(e),t.json({success:!0})):t.json({error:"invalid",success:!1})})},function(){});return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),R.post("/auth",n(),function(e,t){try{console.log("AUTH ATTEMPTED FROM",e.headers.origin,{host:e.body.host});var n=e.body.password;return Promise.resolve(E(function(){return Promise.resolve(h.get(n)).then(function(n){return function(){if(n){var r;if(f.setSeed(n),e.headers.origin&&!x.includes(e.headers.origin))return void t.status(403).json({error:"The origin is not authorized",code:6});var s=e.body.host;console.log({hosts:s,origin:e.headers.origin});var i=function(e){switch(e){case"forever":return 0;case"once":return 1e4;case"1h":return 36e5;case"1d":return 864e5;case"1w":return 6048e5;case"1m":return 2592e6;default:return"once"}}(e.body.expire),c=o(),u=(null==(r=e.body.scopes)?void 0:r.split(","))||[],a={host:s,accessToken:c,scopes:u,icon:e.body.icon,expireTime:Date.now()+i};return Promise.resolve(v.update(a)).then(function(){t.json({success:!0,accessToken:c,expireTime:i,host:s})})}t.json({error:"invalid",success:!1})}()})},function(e){t.status(500).json({success:!1,error:e.toString()})}))}catch(e){return Promise.reject(e)}}),R.get("/prove",function(e,t){try{new URL(e.headers.origin);var n=e.query.message;return Promise.resolve((void 0)(e.query.txid)).then(function(e){if(e){var r=k(n,e);return t.json({message:r.message,key:e,address:r.address,sig:r.sig,ts:r.ts})}t.status(404).json({error:"txid not found",code:4})})}catch(e){return Promise.reject(e)}}),R.get("/auth",function(e,t){try{var n,r=new URL(e.query.returnURL).host,o=U(e.headers),s=o||process.env.TOKENPASS_HOST||"localhost";if(o&&s!==r)return t.status(403).json({error:"The origin is not authorized "+s+" "+r,code:6}),Promise.resolve();var i=e.query.returnURL,c=e.query.icon,u=(null==(n=e.query.scopes)?void 0:n.split(","))||[];return console.log("AUTH GET:",{returnURL:i,icon:c}),t.render("auth",{returnURL:i,icon:c,scopes:u,host:s||"lostlhost"}),Promise.resolve()}catch(e){return Promise.reject(e)}}),R.get("/auth/icon",n(),function(e,t){try{if(e.headers.host!==(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000"))return t.status(403).json({error:"The origin is not authorized"+e.headers.origin,code:6}),Promise.resolve();var n=function(e){try{return Promise.resolve(import("minidenticons")).then(function(t){return t.minidenticon(e)})}catch(e){return Promise.reject(e)}};t.set("Content-Type","image/svg+xml"),t.set("Cache-Control","max-age=31536000");var r=function(){if(f.getSeed())return Promise.resolve(f.findOrCreate({host:"localhost"})).then(function(e){var r=t.send;return Promise.resolve(n(e.pub)).then(function(e){r.call(t,e)})});var e=t.send;return Promise.resolve(n("Anon")).then(function(n){e.call(t,n)})}();return Promise.resolve(r&&r.then?r.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),R.get("/",function(e,t){try{var n=f.getSeed()?Promise.resolve(f.all()).then(function(e){return Promise.resolve(v.all()).then(function(n){t.render("home",{keys:e,states:n,seed:!0})})}):Promise.resolve(h.count()).then(function(n){if(n){var r=U(e.headers);t.render("login",{host:r})}else t.render("home",{seed:!1})});return Promise.resolve(n&&n.then?n.then(function(){}):void 0)}catch(e){return Promise.reject(e)}}),R.listen(process.env.TOKENPASS_PORT||21e3,function(){console.log("TokenPass listening at http://"+(process.env.TOKENPASS_HOST||"localhost")+":"+(process.env.TOKENPASS_PORT||"21000"))})};export{D as init};
//# sourceMappingURL=index.esm.js.map
