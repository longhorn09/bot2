/**
 * This file contains logic to support a few commands including:
 * help, vendor
 * 
 * reference doc for api.file_upload: https://github.com/howdyai/botkit/issues/29
 * base ref:                          https://botkit.ai/docs/v0/readme-web.html
 * slack working with files         : https://api.slack.com/messaging/files/uploading
 */
"use strict";
module.exports = function(controller) {
    var fs = require('fs');
    const path = require('path');
      
 
    // file_created event handler  
    controller.on('file_created',  async function(bot, message) {
      let user_id = null,
          channel_id = null,
          file_id=null;

      file_id = message['file_id'];
      user_id = message['user_id'];
      channel_id = message['channel'];
      //
      //console.log(`file: ${file_id}, user_id: ${user_id}, channel_id: ${channel_id}`);

      fs.writeFile(__dirname + '/file_created.json',JSON.stringify(message), (err) => {
        if (err) throw err;
        console.log(`file for ${file_id} written`);
      }); 

      let val = await bot.api.files.info({       // per @benbrown, "It's a promise"
         file: file_id
      }, (err,res) => {
        if (err) {
          console.log(`Error encountered during files.list: ${err}`);
        }
      }).then( (response) => {
        console.log(JSON.stringify(value));
      });
    });  //end file_created handler

    // Call of Slack API files.list 
    controller.hears(/^\**filelist\**\s*$/, ['message','direct_message'], async function(bot, message) {
      let user_id = null,channel_id=null;
      user_id = message['incoming_message']['from']['id'];
      channel_id = message['incoming_message']['channelData']['channel'];
      console.log(`** in files.list call from ${user_id} in channel ${channel_id}`);  

      let val = await bot.api.files.list({       //https://api.slack.com/methods/files.list 
        token: process.env.OATH_ACCESS_TOKEN,
        page: 1
      }, function(err,res) {
        if (err) {
          console.log(`Error encountered during files.list: ${err}`);
        }
      }).then( (jsonObj) => {
       //   console.log(res['ok']);
          let sb = [];
        
          if (jsonObj.ok === true && jsonObj['files'].length > 0) {            
            //for (let i = 0; i < jsonObj['files'].length;i++)
            for (let i = 0 ; i < 2;i++)
            {
              sb.push(`${i}, id: ${jsonObj.files[i].id}, name: ${jsonObj.files[i].name} , type: ${jsonObj.files[i].filetype}, url_priv_dl: ${jsonObj.files[i]['url_private_download']}`);

            }            
            //console.log(sb.join('\n'));
            let myval = bot.replyEphemeral(message,{
              blocks: [
              {
                "type":"section",
                "text":{
                  "type":"mrkdwn",
                  "text": "```" + sb.join('\n') + "```"
                }
              }]
            }); //end bot.replyEphemeral
          }
          /*  fs.writeFile(__dirname + '/file_list.json',JSON.stringify(value),(err) => {
              if (err) throw err;
              console.log('file_list.json written');
            }); */
         }
      );
    }); //end of filelist handler

    controller.hears(/^\**testxl\**\s*$/, ['message','direct_message'], async function(bot, message) {
        let fileUploadName = 'testXL.xlsx';
        let parentDir = path.normalize(__dirname+"/.."); 
        
        console.log(`${parentDir}/files/${fileUploadName} upload`); 
        bot.api.files.upload({
          file: fs.createReadStream(`${parentDir}/files/${fileUploadName}`),  //ie. multipart/form-data
          filename: fileUploadName,
          filetype: "xlsx",
          channels: message.channel
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
    });  // end of testxl

    controller.hears(/^\**testpdf\**\s*$/, ['message','direct_message'], async function(bot, message) {
        let fileUploadName = 'testPDF.pdf';
        let parentDir = path.normalize(__dirname+"/.."); //https://stackoverflow.com/questions/47403907/node-js-express-dirname-parent-path-get-wrong
        
        console.log(`${parentDir}/files/${fileUploadName} upload`); 
        bot.api.files.upload({
          file: fs.createReadStream(`${parentDir}/files/${fileUploadName}`),  //ie. multipart/form-data
          filename: fileUploadName,
          filetype: "pdf",
          channels: message.channel
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
    });  // end of testpdf
  
 
    //  myid RegEx
    controller.hears(/^\**myid\**\s*$/, ['message','direct_message'], async function(bot, message) {
      let user_id = null,channel_id=null;

      user_id = message['incoming_message']['from']['id'];
      channel_id = message['incoming_message']['channelData']['channel'];
        
      //console.log(message['incoming_message']);
      /*
      fs.writeFile(__dirname + '/mymsg.json',JSON.stringify(message),(err) => {
        if (err) throw err;
        console.log('file written');
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
