#!/usr/bin/env node
import os from "os";
import { init } from "../dist/index.cjs";
const homedir = os.homedir();

init({ db: homedir + "/.tokenpass" });
