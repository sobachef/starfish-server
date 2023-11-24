import { decrypt, encrypt } from "./crypt.js";

class Seed {
  constructor(config) {
    const dbpath = config.db;
    this.db = new config.Datastore({
      filename: dbpath + "/seed.db",
      autoload: true,
    });
    this.wallet = config.wallet;
  }
  get(password) {
    return new Promise((resolve, reject) => {
      this.db.findOne({}, (err, r) => {
        if (r) {
          try {
            let decrypted = decrypt(r.hex, password);
            let s = this.wallet.seed(decrypted);
            resolve(s);
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }
  importKey(hex, password) {
    return new Promise((resolve, reject) => {
      try {
        let s = this.wallet.seed(hex);
        this.db.insert(
          {
            hex: encrypt(s.hex, password),
          },
          (err, res) => {
            resolve(s);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  }
  async exportKey(password) {
    let s = await this.get(password);
    return s.hex;
  }
  count() {
    return new Promise((resolve, reject) => {
      this.db.count({}, (err, count) => {
        resolve(count);
      });
    });
  }
  create(password) {
    return new Promise((resolve, reject) => {
      let s = this.wallet.seed(undefined, password);
      this.db.insert(
        {
          hex: encrypt(s.hex, password),
        },
        (err, res) => {
          resolve(s);
        }
      );
    });
  }
}
export default Seed;
