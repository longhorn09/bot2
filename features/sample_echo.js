/**
 * This file contains logic to support a few commands including:
 * help, vendor
 * 
 * reference doc for api.file_upload: https://github.com/howdyai/botkit/issues/29
 * base ref:                          https://botkit.ai/docs/v0/readme-web.html
 */
"use strict";
module.exports = function(controller) {
    var fs = require('fs');
    const path = require('path');
      
 
    controller.hears(/^testpdf\s*$/, ['message','direct_message'], async function(bot, message) {
        let fileUploadName = 'testPDF.pdf';
        //https://stackoverflow.com/questions/47403907/node-js-express-dirname-parent-path-get-wrong
        let parentDir = path.normalize(__dirname+"/.."); 
        
        console.log(`${parentDir}/files/${fileUploadName} upload`); 
        bot.api.files.upload({
          file: fs.createReadStream(`${parentDir}/files/${fileUploadName}`),  //ie. multipart/form-data
          filename: fileUploadName,
          filetype: "pdf",
 //         channels: message.channel
        }, (err,res) => {
               console.log('in error handler');
               if (err) {
                          console.log(`Failed to add file : ${err}`);
                          bot.reply(message, `Sorry, there has been an error: ${err}`);
               }
               else {
                 console.log(`response: ${res}`);
               }
        });
    });  // end of testfile response handler
  
 
    //  myid RegEx
    controller.hears(/^myid\s*$/, ['message','direct_message'], async function(bot, message) {
      let user_id = null,channel_id=null;

      user_id = message['incoming_message']['from']['id'];
      channel_id = message['incoming_message']['channelData']['channel'];
        
      //console.log(message['incoming_message']);
      /*
      fs.writeFile(__dirname + '/mymsg.json',JSON.stringify(message),(err) => {
        if (err) throw err;
        console.log('ok');
      }); 
      */

      await bot.replyEphemeral(message,{
        blocks: [
        {
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text": "user_id: `" + user_id + "`\n"
                    + "channel: `"+ channel_id +"`"

          }
        }
        ]
      });
    });

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
