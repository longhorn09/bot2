/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = function(controller) {

    controller.hears('sample','message,direct_message', async(bot, message) => {
        await bot.reply(message, 'I heard a sample message.');
    });

    controller.hears('samp2','message,direct_message',async(bot,message) => {
      await bot.replyEphemeral(message,{
        blocks: [
        {
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text":"markdown code below: ```code in markdown```"
          }
        }/*,
        {
          "type":"divider"
        },
        {
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text":"hey this is ```2nd code in markdown```"
          }
        }*/
        ]

      });
    });
  
    /*
    controller.on('message,direct_message', async(bot, message) => {
        await bot.reply(message, `Echo: ${ message.text }`);
    });
    */
}
