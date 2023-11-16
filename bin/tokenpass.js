#!/usr/bin/env node
import os from "os";
import { init } from "../dist/index.esm.js";
const homedir = os.homedir();

init({ db: homedir + "/.tokenpass" });
