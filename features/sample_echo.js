/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = function(controller) {
    //  Vendors RegEx
    controller.hears(/^[vV][eE][nN][dD][oO][rR]([sS])?\s*$/, ['message','direct_message'], async function(bot, message) {
      await bot.replyEphemeral(message,{
        blocks: [
        {
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text": "*Valid vendors*\n```akamai\namazon\ncenturylink\ndatadog\nlevel3\nrackspace```"
          }
        }
        ]
      });
    });

  
    //  Help RegEx
    controller.hears(/^[hH][eE][lL][pP]\s*$/, ['message','direct_message'], async function(bot, message) {
      await bot.replyEphemeral(message,{
        blocks: [
        {
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text": "*Syntax:*  `<command> <vendor> <YYYYMM>`"
          }
        },
        {
           "type": "divider"
        },
        {
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text": "*Example*\n```invoice akamai 201908\nusage akamai 201907```"
          }
        }
        ]
      });
    });
}
