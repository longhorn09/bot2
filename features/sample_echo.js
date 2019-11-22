/**
 * This file contains logic to support a few commands including:
 * help, vendor
 * 
 * reference doc for api.file_upload: https://github.com/howdyai/botkit/issues/29
 * base ref:                          https://botkit.ai/docs/v0/readme-web.html
 */

module.exports = function(controller) {
    var fs = require('fs');
      
 
    // test file response handler, for testing of file uploda and bot.api.files.upload() method
    controller.hears(/^testfile\s*$/, ['message','direct_message'], async function(bot, message) {
        let fileName = 'test.xlsx';
        
        //console.log(__dirname+'/hello.txt');
        console.log(`../${fileName}`); 
        bot.api.files.upload({
        //  file: fs.createReadStream(__dirname+"/hello.txt"),
          file: fs.createReadStream(`../${fileName}`),
          filename: "hello.txt",
          filetype: "text",
          channels: message.channel
        }, (err,res) => { if (err) {
                                    console.log(`Failed to add file : ${err}`);
                                    bot.reply(message, `Sorry, there has been an error: ${err}`);
                          }
        });


      await bot.replyEphemeral(message,{
        blocks: [
        {
          "type":"section",
          "text":{
            "type":"mrkdwn",
            "text": "file uploaded"
          }
        }
        ]
      });
    });  // end of testfile response handler

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
