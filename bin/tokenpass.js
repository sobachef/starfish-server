#!/usr/bin/env node
import os from "os";
import { init } from "../index.js";
const homedir = os.homedir();

init({ db: homedir + "/.tokenpass" });
