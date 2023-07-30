class State {
  constructor(config) {
    const dbpath = config.db;
    this.db = new config.Datastore({
      filename: dbpath + "/state.db",
      autoload: true,
    });
  }
  setState(s) {
    this.state = s;
  }
  getState() {
    return this.state;
  }
  async findOrCreate(o) {
    let state = await this.findOne({ host: o.host });
    // create a state if it doesn't exist
    if (!state) {
      state = await this.insert(o);
    }
    return state;
  }
  findOne(o) {
    return new Promise((resolve, reject) => {
      this.db.findOne(o, (err, state) => {
        if (state) {
          delete state._id;
          resolve(state);
        } else {
          resolve(null);
        }
      });
    });
  }
  find(o) {
    return new Promise((resolve, reject) => {
      this.db.find(o, (err, states) => {
        resolve(states);
      });
    });
  }
  delete(o) {
    return new Promise((resolve, reject) => {
      this.db.remove(o, (err, states) => {
        resolve(states);
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
  insert(state) {
    return new Promise((resolve, reject) => {
      this.db.insert(state, (err, doc) => {
        this.setState(state);
        resolve(state);
      });
    });
  }
  update(state) {
    return new Promise((resolve, reject) => {
      this.db.update(
        { host: state.host },
        { $set: state },
        {
          upsert: true,
          returnUpdatedDocs: true,
        },
        (err, numReplaced, doc) => {
          console.log("UPDATED", { err, accessToken: doc.accessToken });
          this.setState(doc);
          resolve(doc);
        }
      );
    });
  }
  all() {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, states) => {
        resolve(states);
      });
    });
  }
}
export default State;
