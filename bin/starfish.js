#!/usr/bin/env node
const homedir = require('os').homedir();
const starfishd = require('../index')
starfishd({ db: homedir + "/.starfish" })
