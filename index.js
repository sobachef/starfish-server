const express = require('express')
const timeout = require('connect-timeout');
const cors = require('cors')
const Datastore = require('nedb')
const path = require('path')
const ejs = require('ejs')
const fs = require('fs')
const Key = require('./key')
const Seed = require('./seed')
const Wallet = require('./wallet/index')
const app = express()
const port = 21000
const TIMEOUT = 20
const init = (config) => {
  const dbpath = config.db
  if (!fs.existsSync(dbpath)) fs.mkdirSync(dbpath, { recursive: true })
  const seed = new Seed({ db: dbpath, wallet: Wallet, Datastore: Datastore })
  const K = new Key({ db: dbpath, wallet: Wallet, Datastore: Datastore })
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'ejs');
  app.use(timeout("" + TIMEOUT + "s"))
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')))
  app.options('*', cors())
  app.use(express.urlencoded({ extended: false }))
  app.post('/sign', cors(), async (req, res) => {
    let referer = req.headers.origin
    let host = new URL(referer).host
    let message = req.body.message
    if (K.getSeed()) {
      let key = await K.findOrCreate({ host: host })
      if (key) {
        let response = await K.sign({ message: message, key: key})
        response.ts = Date.now()
        res.json(response)
      } else {
        res.json({ error: "please create a wallet.", code: 0 })
      }
    } else {
      res.json({ error: "please check that Starfish is running and you're signed in. check Starfish dashboard at http://localhost:21000", code: 1 })
    }
  })
  // First time seed creation
  app.post("/register", async (req, res) => {
    let s = await seed.create(req.body.password)
    K.setSeed(s) 
    res.json({})
  })
  // Import seed
  app.post("/import", async (req, res) => {
    try {
      let s = await seed.importKey(req.body.hex, req.body.password)
      K.setSeed(s) 
      res.json({})
    } catch (e) {
      res.json({ error: "invalid seed" })
    }
  })
  // Export seed
  app.post("/export", async (req, res) => {
    try {
      let hex = await seed.exportKey(req.body.password)
      if (hex) {
        res.json({ seed: hex }) 
      } else {
        res.json({ error: "invalid" })
      }
    } catch (e) {
    }
  })
  // Decrypt wallet with password at startup
  app.post("/login", async (req, res) => {
    try {
      let s = await seed.get(req.body.password)
      if (s) {
        K.setSeed(s)
        res.json({ success: true })
      } else {
        res.json({ error: "invalid" })
      }
    } catch (e) {
    }
  })
  // Clear seed so the server stops signing requests
  app.post("/logout", (req, res) => {
    K.setSeed(null)
    res.json({ success: true })
  })
  // Dashboard web page
  app.get("/", async (req, res) => {
    if (K.getSeed()) {
      let keys = await K.all()
      res.render("home", { keys: keys, seed: true })
    } else {
      let seedCount = await seed.count()
      if (seedCount) {
        res.render("login")
      } else {
        res.render("home")
      }
    }
  })
  app.listen(port, () => {
    console.log(`Starfish listening at http://localhost:${port}`)
  })
}
module.exports = init
