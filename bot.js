//  __   __  ___        ___
// |__) /  \  |  |__/ |  |  
// |__) \__/  |  |  \ |  |  

// This is the main file for the bot2 bot.

// Import Botkit's core features
const { Botkit } = require('botkit');
const { BotkitCMSHelper } = require('botkit-plugin-cms');

// Import a platform-specific adapter for slack.

const { SlackAdapter, SlackMessageTypeMiddleware, SlackEventMiddleware } = require('botbuilder-adapter-slack');

const { MongoDbStorage } = require('botbuilder-storage-mongodb');

// Load process.env values from .env file
require('dotenv').config();
/*
const log4js = require('log4js');
log4js.configure({appenders: {cheese: {type: 'file',filename:'trace.log'}},
                  categories: {default: {appenders: ['cheese'], level: 'error'}}
                 });
var logger = log4js.getLogger();
logger.level='trace';
*/

let storage = null;
if (process.env.MONGO_URI) {
    storage = mongoStorage = new MongoDbStorage({
        url : process.env.MONGO_URI,
    });
}

// set to true for debugging during development, otherwise false once deployed in production environment
if (false) {
  console.log(`clientId: ${process.env.CLIENT_ID}\n` + 
             `clientSecret: ${process.env.CLIENT_SECRET}\n` +
             `clientSigningSecret ${process.env.CLIENT_SIGNING_SECRET}\n` +
             `redirectUri: ${process.env.REDIRECT_URI}\n` + 
             `verificationToken: ${process.env.VERIFICATION_TOKEN}\n` + 
             `redirectUri: ${process.env.REDIRECT_URI}\n`);
}

/**
 * Initialization of SlackAdapter, including passing of authentication tokens
 * And as well the REDIRECT_URI
 */

const adapter = new SlackAdapter({
    enable_incomplete: false, // REMOVE THIS OPTION AFTER YOU HAVE CONFIGURED YOUR APP!
    verificationToken: process.env.VERIFICATION_TOKEN, //parameters used to secure webhook endpoint
    clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,  
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    scopes: ['bot'],                // ['commands','bot']
    redirectUri: process.env.REDIRECT_URI,
    // functions required for retrieving team-specific info
    // for use in multi-team apps
    getTokenForTeam: getTokenForTeam,
    getBotUserByTeam: getBotUserByTeam,
});

// Use SlackEventMiddleware to emit events that match their original Slack event types.
adapter.use(new SlackEventMiddleware());

// Use SlackMessageType middleware to further classify messages as direct_message, direct_mention, or mention
adapter.use(new SlackMessageTypeMiddleware());


const controller = new Botkit({
    webhook_uri: '/api/messages',
    adapter: adapter,
    storage
});

if (process.env.CMS_URI) {
    controller.usePlugin(new BotkitCMSHelper({
        uri: process.env.CMS_URI,
        token: process.env.CMS_TOKEN,
    }));
}

// Once the bot has booted up its internal services, you can use them to do stuff.
controller.ready(() => {
    // load traditional developer-created local custom feature modules
    controller.loadModules(__dirname + '/features');

    /* catch-all that uses the CMS to trigger dialogs */
    if (controller.plugins.cms) {
        controller.on('message,direct_message', async (bot, message) => {
            let results = false;
            results = await controller.plugins.cms.testTrigger(bot, message);
            if (results !== false) {
                // do not continue middleware!
                return false;
            }
        });
    }

});

controller.webserver.get('/', (req, res) => {
    res.send(`This app is running Botkit ${ controller.version }.`);
});

controller.webserver.get('/install', (req, res) => {
    // getInstallLink points to slack's oauth endpoint and includes clientId and scopes
    res.redirect(controller.adapter.getInstallLink());
});

controller.webserver.get('/install/auth', async (req, res) => {
    try {
        const results = await controller.adapter.validateOauthCode(req.query.code);

        console.log('FULL OAUTH DETAILS', results);

        // Store token by team in bot state.
        tokenCache[results.team_id] = results.bot.bot_access_token;

        // Capture team to bot id
        userCache[results.team_id] =  results.bot.bot_user_id;

        res.json('Success! Bot installed.');

    } catch (err) {
        console.error('OAUTH ERROR:', err);
        res.status(401);
        res.send(err.message);
    }
});

let tokenCache = {};
let userCache = {};

if (process.env.TOKENS) {
    tokenCache = JSON.parse(process.env.TOKENS);
} 

if (process.env.USERS) {
    userCache = JSON.parse(process.env.USERS);
} 

async function getTokenForTeam(teamId) {
    if (tokenCache[teamId]) {
        return new Promise((resolve) => {
            setTimeout(function() {
                resolve(tokenCache[teamId]);
            }, 150);
        });
    } else {
        console.error('Team not found in tokenCache: ', teamId);
    }
}

async function getBotUserByTeam(teamId) {
    if (userCache[teamId]) {
        return new Promise((resolve) => {
            setTimeout(function() {
                resolve(userCache[teamId]);
            }, 150);
        });
    } else {
        console.error('Team not found in userCache: ', teamId);
    }
}

// Log every message received
/*
controller.middleware.receive.use((bot, message, next) => {
     // log it
     console.log('RECEIVED: ', message);
     // modify the message
     message.logged = true;

     // continue processing the message
     next();
});
*/
