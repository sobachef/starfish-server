import e from"body-parser";import t from"connect-timeout";import s from"cors";import r,{randomUUID as o}from"crypto";import n from"express";import i from"fs";import a from"nedb";import c,{dirname as d}from"path";import{fileURLToPath as u}from"url";import h from"bitcore-lib";function l(){return l=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var r in s)Object.prototype.hasOwnProperty.call(s,r)&&(e[r]=s[r])}return e},l.apply(this,arguments)}class g{constructor(e){this.db=new e.Datastore({filename:e.db+"/keys.db",autoload:!0}),this.wallet=e.wallet,this.config=e}setSeed(e){this.seed=e}getSeed(){return this.seed}sign(e){return this.wallet.sign(e.message,e.key,e.encoding)}encrypt(e){return this.wallet.encrypt(e.message,e.key)}async findOrCreate(e){let t=await this.findOne(e);if(!t){let s=await this.count({});if(!this.seed)return console.log("Please go to http://localhost:21000 and create a wallet"),null;t=await this.wallet.create(this.seed,s,e),t=await this.insert(t)}return t}findOne(e){return new Promise((t,s)=>{this.db.findOne(e,(e,s)=>{t(s?this.transform(s):null)})})}find(e){return new Promise((t,s)=>{this.db.find(e,(e,s)=>{t(s.map(e=>this.transform(e)))})})}count(e){return new Promise((t,s)=>{this.db.count(e,(e,s)=>{t(s)})})}insert(e){return new Promise((t,s)=>{this.db.insert(e,(s,r)=>{t(this.transform(e))})})}transform(e){let t=this.wallet.derive(this.seed,e.path);return e.priv=t.privateKey.toString(),e.pub=t.publicKey.toString(),e.address=t.publicKey.toAddress().toString(),e}all(){return new Promise((e,t)=>{this.db.find({},(t,s)=>{e(s.map(e=>this.transform(e)))})})}}function f(e,t,s){const o=r.randomBytes(16);s||(s=r.createHash("sha256").update(t).digest());let n=r.createCipheriv("aes-256-cbc",s,o),i=n.update(e);return i=Buffer.concat([i,n.final()]),{iv:o.toString("hex"),encryptedData:i.toString("hex")}}class p{constructor(e){this.db=new e.Datastore({filename:e.db+"/seed.db",autoload:!0}),this.wallet=e.wallet}get(e){return new Promise((t,s)=>{this.db.findOne({},(s,o)=>{if(o)try{let s=function(e,t,s){const o=Buffer.from(e.iv,"hex");s||(s=r.createHash("sha256").update(t).digest());let n=Buffer.from(e.encryptedData,"hex"),i=r.createDecipheriv("aes-256-cbc",s,o),a=i.update(n);return a=Buffer.concat([a,i.final()]),a.toString()}(o.hex,e),n=this.wallet.seed(s);t(n)}catch(e){t(null)}else t(null)})})}importKey(e,t){return new Promise((s,r)=>{try{let r=this.wallet.seed(e);this.db.insert({hex:f(r.hex,t)},(e,t)=>{s(r)})}catch(e){r(e)}})}async exportKey(e){return(await this.get(e)).hex}count(){return new Promise((e,t)=>{this.db.count({},(t,s)=>{e(s)})})}create(e){return new Promise((t,s)=>{let r=this.wallet.seed();this.db.insert({hex:f(r.hex,e)},(e,s)=>{t(r)})})}}class m{constructor(e){this.db=new e.Datastore({filename:e.db+"/state.db",autoload:!0})}setState(e){this.state=e}getState(){return this.state}async findOrCreate(e){let t=await this.findOne({host:e.host});return t||(t=await this.insert(e)),t}findOne(e){return new Promise((t,s)=>{this.db.findOne(e,(e,s)=>{s?(delete s._id,t(s)):t(null)})})}find(e){return new Promise((t,s)=>{this.db.find(e,(e,s)=>{t(s)})})}delete(e){return new Promise((t,s)=>{this.db.remove(e,(e,s)=>{t(s)})})}count(e){return new Promise((t,s)=>{this.db.count(e,(e,s)=>{t(s)})})}insert(e){return new Promise((t,s)=>{this.db.insert(e,(s,r)=>{this.setState(e),t(e)})})}update(e){return new Promise((t,s)=>{this.db.update({host:e.host},{$set:e},{upsert:!0,returnUpdatedDocs:!0},(e,s,r)=>{console.log("UPDATED",{err:e,accessToken:r.accessToken}),this.setState(r),t(r)})})}all(){return new Promise((e,t)=>{this.db.find({},(t,s)=>{e(s)})})}}var y=h.deps._,w=h.PrivateKey,b=h.PublicKey,v=h.Address,S=h.encoding.BufferWriter,j=h.crypto.ECDSA,k=h.crypto.Signature,x=h.crypto.Hash.sha256sha256,P=h.util.js,T=h.util.preconditions,O=function e(t,s="utf8"){return this instanceof e?(T.checkArgument(y.isString(t),"First argument should be a string. You can specify the encoding as the second parameter"),T.checkArgument(["ascii","utf8","utf16le","ucs2","base64","latin1","binary","hex"].includes(s),"Second argument should be a valid BufferEncoding: 'utf8', 'hex', or 'base64', etc"),this.message=t,this.encoding=s,this):new e(t,s)};O.MAGIC_BYTES=Buffer.from("Bitcoin Signed Message:\n"),O.prototype.magicHash=function(){var e=S.varintBufNum(O.MAGIC_BYTES.length),t=Buffer.from(this.message,this.encoding),s=S.varintBufNum(t.length),r=Buffer.concat([e,O.MAGIC_BYTES,s,t]);return x(r)},O.prototype._sign=function(e){T.checkArgument(e instanceof w,"First argument should be an instance of PrivateKey");var t=this.magicHash(),s=new j;return s.hashbuf=t,s.privkey=e,s.pubkey=e.toPublicKey(),s.signRandomK(),s.calci(),s.sig},O.prototype.sign=function(e){let t=e.toWIF();return e=w.fromWIF(t),this._sign(e).toCompact().toString("base64")},O.prototype._verify=function(e,t){T.checkArgument(e instanceof b,"First argument should be an instance of PublicKey"),T.checkArgument(t instanceof k,"Second argument should be an instance of Signature");var s=this.magicHash(),r=j.verify(s,t,e);return r||(this.error="The signature was invalid"),r},O.prototype.verify=function(e,t){T.checkArgument(e),T.checkArgument(t&&y.isString(t)),y.isString(e)&&(e=v.fromString(e));var s=k.fromCompact(Buffer.from(t,"base64")),r=new j;r.hashbuf=this.magicHash(),r.sig=s;var o=r.toPublicKey(),n=v.fromPublicKey(o,e.network);return e.toString()!==n.toString()?(this.error="The signature did not match the message digest",!1):this._verify(o,s)},O.fromString=function(e){return new O(e)},O.fromJSON=function(e){return P.isValidJSON(e)&&(e=JSON.parse(e)),new O(e.message)},O.prototype.toObject=function(){return{message:this.message,encoding:this.encoding}},O.prototype.toJSON=function(){return JSON.stringify(this.toObject())},O.prototype.toString=function(){return this.message},O.prototype.inspect=function(){return"<Message: "+this.toString()+">"},delete global._bitcore;const R=(e,t,s)=>{const r=h.PrivateKey.fromWIF(t.priv),o=O(e,s);return{address:t.address,message:e,sig:o.sign(r),ts:Date.now()}};var U={__proto__:null,sign:R,encrypt:(e,t)=>{const s=f(e,null,h.PrivateKey.fromWIF(t.priv).toBuffer());return{address:t.address,data:s,ts:Date.now()}},create:async(e,t,s)=>{const r=`m/44'/0'/${t}'/2/0`,o=e.key.deriveChild(r),n=o.privateKey.toAddress().toString();return{path:r,pub:o.publicKey.toString(),address:n,host:s.host}},seed:e=>{let t=e?Buffer.from(e,"hex"):h.crypto.Random.getRandomBuffer(64);try{let e=h.HDPrivateKey.fromSeed(t);return{hex:t.toString("hex"),key:e}}catch(e){throw console.log("error",e),e}},derive:(e,t)=>e.key.deriveChild(t),verify:(e,t,s,r)=>O(e,r).verify(t,s)};const C=async e=>(await import("minidenticons")).minidenticon(e),L=d(u(import.meta.url)),A=n(),B=e=>e.origin?new URL(e.origin).host:null,D=r=>{const d=r.db;i.existsSync(d)||i.mkdirSync(d,{recursive:!0});const u=new p({db:d,wallet:U,Datastore:a}),h=new g({db:d,wallet:U,Datastore:a}),f=new m({db:d,Datastore:a});A.set("views",c.join(L,"views")),A.set("view engine","ejs"),A.use(t("20s")),A.use(e.json({limit:"50mb"})),A.use(e.raw({type:"application/octet-stream",limit:"50mb"})),A.use(e.urlencoded({limit:"50mb",extended:!0})),A.use(n.static(c.join(L,"public"))),A.options("*",s()),A.use(n.urlencoded({extended:!1})),A.post("/sign",s(),async(e,t)=>{let s=e.body.message,r=e.body.encoding||"utf8";if(h.getSeed()){const o=e.headers.authorization;if(void 0===o|null===o)return void t.status(401).json({error:"Please provide an access token in the Authorization header.",code:2,success:!1,errorURL:"http://localhost:21000/auth"});const n=await f.findOne({accessToken:o});if(null==n||!n.accessToken||n.accessToken!==o)return void t.status(401).json({error:"Invalid access token.",errorURL:"http://localhost:21000/auth",code:3,success:!1});let i=o?n.host:B(e.headers);i||(i="localhost",console.log("no origin, using",i));const a=n.expireTime&&n.expireTime<Date.now();if(console.log("SIGN:",{expireTime:n.expireTime,now:Date.now(),host:i}),a)return void t.status(401).json({error:"Access token has expired.",errorURL:"http://localhost:21000/auth",code:5});let c=await h.findOrCreate({host:i});if(c){let e=await h.sign({message:s,key:c,encoding:r,ts:Date.now()});return void t.status(200).json(e)}t.status(417).json({error:"please create a wallet.",success:!1})}else t.status(401).json({errorURL:"http://localhost:21000/auth",error:"Check that TokenPass is running and you're signed in.",code:1})}),A.post("/encrypt",s(),async(e,t)=>{let s=e.body.message;if(h.getSeed()){const r=e.headers.authorization;if(void 0===r|null===r)return void t.status(401).json({error:"Please provide an access token in the Authorization header.",code:2,success:!1,errorURL:"http://localhost:21000/auth"});B(e.headers);const o=await f.findOne({accessToken:r});if(!o)return void t.status(401).json({error:"Invalid access token.",errorURL:"http://localhost:21000/auth",code:3,success:!1});const n=await h.findOrCreate({host:o.host});if(!n)return void t.status(417).json({error:"please create a wallet."});const{address:i,data:a,sig:c,ts:d}=h.encrypt({message:s,key:n});console.log({address:i,data:a,sig:c,ts:d}),t.status(200).json({data:a,address:i,sig:c,ts:d})}else t.status(401).json({errorURL:"http://localhost:21000/auth",error:"Check that TokenPass is running and you're signed in.",code:1})}),A.post("/register",async(e,t)=>{let s=await u.create(e.body.password);h.setSeed(s);const r=await f.findOrCreate({host:"localhost"});r.icon||(r.icon="/auth/icon",await f.update(r)),t.json({})}),A.post("/import",async(e,t)=>{try{let s=await u.importKey(e.body.hex,e.body.password);h.setSeed(s),t.json({})}catch(e){t.json({error:"invalid seed",success:!1})}}),A.post("/export",async(e,t)=>{try{let s=await u.exportKey(e.body.password);s?t.json({seed:s}):t.status(401).json({error:"invalid",success:!1,errorURL:"http://localhost:21000/auth"})}catch(e){}}),A.post("/state",s(),async(e,t)=>{let s=new URL(e.headers.origin).host;await f.findOne({host:s})?"clear"===e.query.mode?(await f.delete({host:s}),await f.update(l({},e.body,{host:s}))):f.update(l({},e.body,{host:s})):f.insert(l({},e.body,{host:s})),t.json({success:!0})}),A.post("/profile",s(),async(e,t)=>{if(h.getSeed()){let s="global";try{const r=await f.findOne({host:s});let o=l({},e.body,{host:s});r?("clear"===e.query.mode&&await f.delete({host:s}),f.update(o)):f.insert(o),t.json({success:!0})}catch(e){console.error(e),t.status(500).json({success:!1,error:e.toString()})}}else t.status(401).json({error:"please check that TokenPass is running and you're signed in. check TokenPass dashboard at http://localhost:21000",code:1,errorURL:"http://localhost:21000"})}),A.delete("/state",s(),async(e,t)=>{let s=new URL(e.headers.origin).host;f.delete(l({},e.body,{host:s})),t.json({success:!0})}),A.get("/profile",s(),async(e,t)=>{let s=await f.findOne({host:"global"});t.json(s)}),A.get("/state",s(),async(e,t)=>{let s=new URL(e.headers.origin).host,r=await f.findOne({host:s});t.json(r)}),A.post("/login",async(e,t)=>{try{let s=await u.get(e.body.password);s?(h.setSeed(s),t.json({success:!0})):t.json({error:"invalid",success:!1})}catch(e){}}),A.post("/logout",s(),(e,t)=>{h.setSeed(null),t.json({success:!0})}),A.post("/fund",s(),async(e,t)=>{if(h.getSeed()){var s;const r="http://localhost:21001/fund";let o=e.headers.origin,n=o?new URL(o).host:"localhost";const i=await f.findOne({host:n});if(null==(s=i.scopes)||!s.includes("fund"))return void t.status(403).json({error:"Insufficient permission",code:7});const a=i.accessToken;let c=e.body.rawtx;try{const e=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rawtx:c,broadcast:!0,sigma:!0,host:n,authToken:a})}),s=await e.json();t.json(s)}catch(e){console.error(e),t.status(500).json({success:!1,error:e.toString()})}}else t.status(401).json({error:"please check that TokenPass is running and you're signed in. check TokenPass dashboard at http://localhost:21000",code:1,errorURL:"http://localhost:21000/auth"})}),A.post("/login",async(e,t)=>{try{let s=await u.get(e.body.password);s?(h.setSeed(s),t.json({success:!0})):t.json({error:"invalid",success:!1})}catch(e){}}),A.post("/auth",s(),async(e,t)=>{try{let r=await u.get(e.body.password);if(r){var s;if(h.setSeed(r),"http://localhost:21000"!==e.headers.origin)return void t.status(403).json({error:"The origin is not authorized",code:6});const n=e.body.host;console.log({hosts:n,origin:e.headers.origin});const i=(e=>{switch(e){case"forever":return 0;case"once":return 1e4;case"1h":return 36e5;case"1d":return 864e5;case"1w":return 6048e5;case"1m":return 2592e6;default:return defaultExpireTime}})(e.body.expire),a=o(),c={host:n,accessToken:a,scopes:(null==(s=e.body.scopes)?void 0:s.split(","))||[],icon:e.body.icon,expireTime:Date.now()+i};await f.update(c),t.json({success:!0,accessToken:a,expireTime:i,host:n})}else t.json({error:"invalid",success:!1})}catch(e){t.status(500).json({success:!1,error:e.toString()})}}),A.get("/prove",async(e,t)=>{new URL(e.headers.origin);let s=e.query.txid,r=e.query.message,o=await(void 0)(s);if(!o)return void t.status(404).json({error:"txid not found",code:4});const{address:n,message:i,sig:a,ts:c}=R(r,o);return t.json({message:i,key:o,address:n,sig:a,ts:c})}),A.get("/auth",async(e,t)=>{var s;const r=new URL(e.query.returnURL).host,o=B(e.headers)||"localhost";if(o!==r)return void t.status(403).json({error:"The origin is not authorized "+o+" "+r,code:6});const n=e.query.returnURL,i=e.query.icon,a=(null==(s=e.query.scopes)?void 0:s.split(","))||[];console.log("AUTH GET:",{returnURL:n,icon:i}),t.render("auth",{returnURL:n,icon:i,scopes:a,host:o||"lostlhost"})}),A.get("/auth/icon",s(),async(e,t)=>{if("localhost:21000"===e.headers.host)if(t.set("Content-Type","image/svg+xml"),t.set("Cache-Control","max-age=31536000"),h.getSeed()){let e=await h.findOrCreate({host:"localhost"});t.send(C(e.pub))}else t.send(C("Anon"));else t.status(403).json({error:"The origin is not authorized"+e.headers.origin,code:6})}),A.get("/",async(e,t)=>{if(h.getSeed()){let e=await h.all()||[],s=await f.all()||[];t.render("home",{keys:e,states:s,seed:!0})}else if(await u.count()){const s=B(e.headers);t.render("login",{host:s})}else t.render("home",{seed:!1})}),A.listen(21e3,()=>{console.log("TokenPass listening at http://localhost:21000")})};export{D as init};
//# sourceMappingURL=index.modern.js.map