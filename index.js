import bodyParser from "body-parser";
import timeout from "connect-timeout";
import cors from "cors";
import { randomUUID } from "crypto";
import express from "express";
import fs from "fs";
import Datastore from "nedb";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import Key from "./key.js";
import Seed from "./seed.js";
import State from "./state.js";
import * as Wallet from "./wallet/index.js";

const minidenticon = async (str) => {
  const module = await import("minidenticons");
  return module.minidenticon(str);
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const TIMEOUT = 20;
const defaultPort = 21000;

const hostFromOrigin = (headers) => {
  return headers.origin ? new URL(headers.origin).host : null; // "localhost";
};

const expireSelectionToTime = (expireSelection) => {
  switch (expireSelection) {
    case "forever":
      return 0;
    case "once":
      return 10000;
    case "1h":
      return 3600000;
    case "1d":
      return 86400000;
    case "1w":
      return 604800000;
    case "1m":
      return 2592000000;
    default:
      return defaultExpireTime;
  }
};

const init = (config) => {
  const dbpath = config.db;
  if (!fs.existsSync(dbpath)) fs.mkdirSync(dbpath, { recursive: true });
  const seed = new Seed({ db: dbpath, wallet: Wallet, Datastore: Datastore });
  const K = new Key({ db: dbpath, wallet: Wallet, Datastore: Datastore });
  const S = new State({ db: dbpath, Datastore: Datastore });
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");
  app.use(timeout("" + TIMEOUT + "s"));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.raw({ type: "application/octet-stream", limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
  app.use(express.static(path.join(__dirname, "public")));
  app.options("*", cors());
  app.use(express.urlencoded({ extended: false }));

  // Sign a message
  app.post("/sign", cors(), async (req, res) => {
    // when a tokenpass wallet connects the referrer is empty

    let message = req.body.message;
    let encoding = req.body.encoding || "utf8";

    if (K.getSeed()) {
      // Check for an access token
      const accessToken = req.headers.authorization;
      if ((accessToken === undefined) | (accessToken === null)) {
        res.status(401).json({
          error: "Please provide an access token in the Authorization header.",
          code: 2,
          success: false,
          errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
            process.env.TOKENPASS_PORT || "21000"
          }/auth`,
        });
        return;
      }

      // Check that the access token is valid
      const state = await S.findOne({ accessToken });

      if (!state?.accessToken || state.accessToken !== accessToken) {
        res.status(401).json({
          error: "Invalid access token.",
          errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
            process.env.TOKENPASS_PORT || "21000"
          }/auth`,
          code: 3,
          success: false,
        });
        return;
      }

      let host = accessToken ? state.host : hostFromOrigin(req.headers);
      // use host associated with the access token if provided
      if (!host) {
        // no host means its youself on localhost
        host = process.env.TOKENPASS_HOST || "localhost";
        console.log("no origin, using", host);
      }

      const expired = state.expireTime && state.expireTime < Date.now();

      console.log("SIGN:", {
        expireTime: state.expireTime,
        now: Date.now(),
        host,
      });

      // Check that the access token is not expired
      if (expired) {
        res.status(401).json({
          error: "Access token has expired.",
          errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
            process.env.TOKENPASS_PORT || "21000"
          }/auth`,
          code: 5,
        });
        return;
      }

      let key = await K.findOrCreate({ host: host });
      if (key) {
        let signedResponse = await K.sign({
          message: message,
          key: key,
          encoding: encoding,
          ts: Date.now(),
        });

        // Rotate the access token
        // const newAccessToken = randomUUID();
        // await S.update({
        //   host,
        //   accessToken: newAccessToken,
        // });

        // signedResponse.accessToken = newAccessToken;

        res.status(200).json(signedResponse);
        return;
      } else {
        res
          .status(417)
          .json({ error: "please create a wallet.", success: false });
        return;
      }
    } else {
      res.status(401).json({
        errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
          process.env.TOKENPASS_PORT || "21000"
        }/auth`,
        error: "Check that TokenPass is running and you're signed in.",
        code: 1,
      });
    }
  });

  app.post("/encrypt", cors(), async (req, res) => {
    let message = req.body.message;

    if (K.getSeed()) {
      // Check for an access token
      const accessToken = req.headers.authorization;
      if ((accessToken === undefined) | (accessToken === null)) {
        res.status(401).json({
          error: "Please provide an access token in the Authorization header.",
          code: 2,
          success: false,
          errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
            process.env.TOKENPASS_PORT || "21000"
          }/auth`,
        });
        return;
      }

      const host = hostFromOrigin(req.headers);

      // TODO:Check that the access token is valid
      const state = await S.findOne({ accessToken });
      if (!state) {
        res.status(401).json({
          error: "Invalid access token.",
          errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
            process.env.TOKENPASS_PORT || "21000"
          }/auth`,
          code: 3,
          success: false,
        });
        return;
      }

      const key = await K.findOrCreate({ host: state.host });
      if (!key) {
        res.status(417).json({ error: "please create a wallet." });
        return;
      }

      const { address, data, sig, ts } = K.encrypt({ message, key });
      console.log({ address, data, sig, ts });
      res.status(200).json({ data, address, sig, ts });
    } else {
      res.status(401).json({
        errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
          process.env.TOKENPASS_PORT || "21000"
        }/auth`,
        error: "Check that TokenPass is running and you're signed in.",
        code: 1,
      });
    }
  });

  // First time seed creation
  app.post("/register", async (req, res) => {
    let s = await seed.create(req.body.password);
    K.setSeed(s);

    // create first state for localhost with an icon
    const state = await S.findOrCreate({
      host: process.env.TOKENPASS_HOST || "localhost",
    });
    if (!state.icon) {
      state.icon = "/auth/icon";
      await S.update(state);
    }

    res.json({});
  });

  // Import seed
  app.post("/import", async (req, res) => {
    try {
      let s = await seed.importKey(req.body.hex, req.body.password);
      K.setSeed(s);
      res.json({});
    } catch (e) {
      res.json({ error: "invalid seed", success: false });
    }
  });

  // Export seed
  app.post("/export", async (req, res) => {
    try {
      let hex = await seed.exportKey(req.body.password);
      if (hex) {
        res.json({ seed: hex });
      } else {
        res.status(401).json({
          error: "invalid",
          success: false,
          errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
            process.env.TOKENPASS_PORT || "21000"
          }/auth`,
        });
      }
    } catch (e) {}
  });

  // Update state object
  app.post("/state", cors(), async (req, res) => {
    let referer = req.headers.origin;
    let host = new URL(referer).host;

    const s = await S.findOne({ host });
    if (s) {
      if (req.query.mode === "clear") {
        await S.delete({ host });
        await S.update({ ...req.body, host });
      } else {
        S.update({ ...req.body, host });
      }
    } else {
      S.insert({ ...req.body, host });
    }

    res.json({ success: true });
  });

  // Update profile object
  app.post("/profile", cors(), async (req, res) => {
    if (K.getSeed()) {
      let host = "global";
      try {
        const s = await S.findOne({ host });
        let finalState = { ...req.body, host };
        if (s) {
          if (req.query.mode === "clear") {
            await S.delete({ host });
          }
          S.update(finalState);
        } else {
          S.insert(finalState);
        }
        res.json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: error.toString() });
      }
    } else {
      res.status(401).json({
        error:
          "please check that TokenPass is running and you're signed in. check TokenPass dashboard at http://localhost:21000",
        code: 1,
        errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
          process.env.TOKENPASS_PORT || "21000"
        }`,
      });
    }
  });

  // Update state object
  app.delete("/state", cors(), async (req, res) => {
    let referer = req.headers.origin;
    let host = new URL(referer).host;

    S.delete({ ...req.body, host });

    res.json({ success: true });
  });

  // Get the global profile
  app.get("/profile", cors(), async (req, res) => {
    let state = await S.findOne({ host: "global" });
    res.json(state);
  });

  // Get the state object
  app.get("/state", cors(), async (req, res) => {
    let referer = req.headers.origin;
    let host = new URL(referer).host;

    let state = await S.findOne({ host });

    res.json(state);
  });

  // Decrypt wallet with password at startup
  app.post("/login", async (req, res) => {
    try {
      let s = await seed.get(req.body.password);
      if (s) {
        K.setSeed(s);

        // We do not give an access token here.
        // Those are per hose, this is global
        res.json({ success: true });
      } else {
        res.json({ error: "invalid", success: false });
      }
    } catch (e) {}
  });

  // Clear seed so the server stops signing requests
  app.post("/logout", cors(), (req, res) => {
    K.setSeed(null);
    res.json({ success: true });
  });

  // Ask a connected wallet to fund a raw tx
  app.post("/fund", cors(), async (req, res) => {
    const key = K.getSeed();
    if (key) {
      const url = `http://${process.env.TOKENPASS_HOST || "localhost"}:${
        process.env.TOKENPASS_PORT || "21000"
      }/fund`;
      let referer = req.headers.origin;
      let host = referer ? new URL(referer).host : "localhost";

      // make sure we have permission to fund for this host
      const state = await S.findOne({ host });
      if (!state.scopes?.includes("fund")) {
        res.status(403).json({
          error: "Insufficient permission",
          code: 7,
        });
        return;
      }

      const authToken = state.accessToken;
      let rawtx = req.body.rawtx;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rawtx,
            broadcast: true,
            sigma: true,
            host,
            authToken,
          }),
        });

        const json = await response.json();
        res.json(json);
      } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: e.toString() });
      }
    } else {
      res.status(401).json({
        error:
          "please check that TokenPass is running and you're signed in. check TokenPass dashboard at http://localhost:21000",
        code: 1,
        errorURL: `http://${process.env.TOKENPASS_HOST || "localhost"}:${
          process.env.TOKENPASS_PORT || "21000"
        }/auth`,
      });
    }
  });

  // Decrypt wallet with password at startup
  app.post("/login", async (req, res) => {
    try {
      let s = await seed.get(req.body.password);
      if (s) {
        K.setSeed(s);
        res.json({ success: true });
      } else {
        res.json({ error: "invalid", success: false });
      }
    } catch (e) {}
  });

  // Create an auth token for some amount of time
  app.post("/auth", cors(), async (req, res) => {
    try {
      let s = await seed.get(req.body.password);
      if (s) {
        K.setSeed(s);

        // ! Forbid auth from any outside origin
        if (
          req.headers.origin !==
          `http://${process.env.TOKENPASS_HOST || "localhost"}:${
            process.env.TOKENPASS_PORT || "21000"
          }`
        ) {
          res.status(403).json({
            error: "The origin is not authorized",
            code: 6,
          });
          return;
        }

        // Auth gets the host from the request body
        const host = req.body.host;
        console.log({ hosts: host, origin: req.headers.origin });

        const expireSelection = req.body.expire;
        const expireTime = expireSelectionToTime(expireSelection);

        const accessToken = randomUUID();
        const scopes = req.body.scopes?.split(",") || [];
        const newState = {
          host,
          accessToken,
          scopes,
          icon: req.body.icon,
          expireTime: Date.now() + expireTime,
        };
        await S.update(newState);
        res.json({ success: true, accessToken, expireTime, host });
      } else {
        res.json({ error: "invalid", success: false });
      }
    } catch (e) {
      res.status(500).json({ success: false, error: e.toString() });
    }
  });

  // Ask wallet to prove ownership of a txid
  app.get("/prove", async (req, res) => {
    let referer = req.headers.origin;
    let host = new URL(referer).host;
    let txid = req.query.txid;
    let challengeStr = req.query.message;

    // TODO: Find this txid in utxo store
    let key = await Wallet.keyForTx(txid);
    if (!key) {
      res.status(404).json({
        error: "txid not found",
        code: 4,
      });
      return;
    }
    const { address, message, sig, ts } = Wallet.sign(challengeStr, key);
    return res.json({ message, key, address, sig, ts });
  });

  // OAuth style login page for apps
  app.get("/auth", async (req, res) => {
    const returnHost = new URL(req.query.returnURL).host;
    const host =
      hostFromOrigin(req.headers) || process.env.TOKENPASS_HOST || "localhost";

    if (host !== returnHost) {
      res.status(403).json({
        error: "The origin is not authorized " + host + " " + returnHost,
        code: 6,
      });
      return;
    }

    const returnURL = req.query.returnURL;
    const icon = req.query.icon;
    const scopes = req.query.scopes?.split(",") || [];

    console.log("AUTH GET:", {
      returnURL,
      icon,
    });
    res.render("auth", {
      returnURL,
      icon,
      scopes,
      host: host || "lostlhost",
    });
  });

  // Icon intended to be rendered in the auth page only
  app.get("/auth/icon", cors(), async (req, res) => {
    // ! Forbid auth from any outside host
    if (
      req.headers.host !==
      `${process.env.TOKENPASS_HOST || "localhost"}:${
        process.env.TOKENPASS_PORT || "21000"
      }`
    ) {
      res.status(403).json({
        error: "The origin is not authorized" + req.headers.origin,
        code: 6,
      });
      return;
    }

    res.set("Content-Type", "image/svg+xml");
    res.set("Cache-Control", "max-age=31536000");

    // derive a icon from localhost key
    if (K.getSeed()) {
      let k = await K.findOrCreate({
        host: "localhost",
      });

      res.send(minidenticon(k.pub));
    } else {
      // default icon
      res.send(minidenticon("Anon"));
    }
  });

  // Dashboard web page
  app.get("/", async (req, res) => {
    if (K.getSeed()) {
      // if host is specified
      let keys = (await K.all()) || [];
      let states = (await S.all()) || [];
      res.render("home", { keys, states, seed: true });
    } else {
      let seedCount = await seed.count();
      if (seedCount) {
        const host = hostFromOrigin(req.headers);
        res.render("login", { host });
      } else {
        res.render("home", { seed: false });
      }
    }
  });

  app.listen(process.env.TOKENPASS_PORT || defaultPort, () => {
    console.log(
      `TokenPass listening at http://${
        process.env.TOKENPASS_HOST || "localhost"
      }:${process.env.TOKENPASS_PORT || "21000"}`
    );
  });
};
export { init };
