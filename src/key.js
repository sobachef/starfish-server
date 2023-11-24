class Key {
  constructor(config) {
    const dbpath = config.db;
    this.db = new config.Datastore({
      filename: dbpath + "/keys.db",
      autoload: true,
    });
    this.wallet = config.wallet;
    this.config = config;
  }
  setSeed(s) {
    this.seed = s;
  }
  getSeed() {
    return this.seed;
  }
  sign(o) {
    return this.wallet.sign(o.message, o.key, o.encoding);
  }
  encrypt(o) {
    return this.wallet.encrypt(o.message, o.key);
  }
  async findOrCreate(o) {
    let key = await this.findOne(o);
    // create a key if it doesn't exist
    if (!key) {
      let count = await this.count({});
      if (this.seed) {
        key = await this.wallet.create(this.seed, count, o);
        key = await this.insert(key);
      } else {
        console.log("Please go to http://localhost:21000 and create a wallet");
        return null;
      }
    }
    return key;
  }
  findOne(o) {
    return new Promise((resolve, reject) => {
      this.db.findOne(o, (err, key) => {
        if (key) {
          resolve(this.transform(key));
        } else {
          resolve(null);
        }
      });
    });
  }
  find(o) {
    return new Promise((resolve, reject) => {
      this.db.find(o, (err, keys) => {
        resolve(
          keys.map((k) => {
            return this.transform(k);
          })
        );
      });
    });
  }
  count(o) {
    return new Promise((resolve, reject) => {
      this.db.count(o, (err, count) => {
        resolve(count);
      });
    });
  }
  insert(key) {
    return new Promise((resolve, reject) => {
      this.db.insert(key, (err, doc) => {
        resolve(this.transform(key));
      });
    });
  }
  transform(key) {
    let derived = this.wallet.derive(this.seed, key.path);
    key.priv = derived.privateKey.toString();
    key.pub = derived.publicKey.toString();
    key.address = derived.publicKey.toAddress().toString();
    return key;
  }
  all() {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, keys) => {
        resolve(
          keys.map((k) => {
            return this.transform(k);
          })
        );
      });
    });
  }
}
export default Key;
