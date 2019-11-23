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
      
    //######################################################
    // https://api.slack.com/events/file_deleted
    //######################################################
    controller.on('file_deleted',  async (bot, message) => {
      let file_id=null;

      file_id = message['file_id'];
      console.log(`file: ${file_id}`);

      /*
      fs.writeFile(__dirname + '/file_deleted.json',JSON.stringify(message), (err) => {
        if (err) throw err;
        console.log(`file_deleted.json for ${file_id} written`);
      }); 
      */

      let val = await bot.api.chat.postMessage({       // "It's a promise"
         token: process.env.BOT_TOKEN,
         channel: 'UN8SXSVA5',  //harded user_id for me (developer)
         text: "file `" + file_id + "` deleted"
      }, (err,res) => {
        if (err) {
          console.log(`Error encountered during bot.api.chat.postMessage: ${err}`);
        }
      });
    });  //end file_created handler
 
    //######################################################
    // file_created event handler  
    //######################################################
    controller.on('file_created',  async function(bot, message) {
      let file_id = null;

      file_id = message['file_id'];

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
        console.log(JSON.stringify(response));
      });
    });  //end file_created handler

    //######################################################
    // Call of Slack API files.delete
    // for cleanup of pdf, xlsx, and text files that were created during testing
    //######################################################
    controller.hears(/^\**filedel\**\s*$/, ['message','direct_message'], async function(bot, message) {
      let user_id = null,channel_id=null;
      user_id = message['incoming_message']['from']['id'];
      channel_id = message['incoming_message']['channelData']['channel'];
      //console.log(`** in files.list call from ${user_id} in channel ${channel_id}`);  

      let val = await bot.api.files.list({       //https://api.slack.com/methods/files.list 
        token: process.env.OATH_ACCESS_TOKEN,
        page: 1
      }, function(err,res) {
        if (err) {
          console.log(`Error encountered during files.list: ${err}`);
        }
      }).then( (jsonObj) => {
       //   console.log(res['ok']);
          let file_id=null;
          if (jsonObj.ok === true && jsonObj['files'].length > 0) {            
            //for (let i = 0; i < jsonObj['files'].length;i++)
            //for (let i = 0 ; i < 5;i++)
            console.log(`files in list: ${jsonObj['files'].length}`);
            for (let i = (jsonObj['files'].length-1); i>=0;i--)  
            {
              //console.log(`id[${i}]: ${jsonObj.files[i].id}, name: ${jsonObj.files[i].name} , type: ${jsonObj.files[i].filetype}`);
              if (jsonObj.files[i].filetype=='pdf' || jsonObj.files[i].filetype=='xlsx' || jsonObj.files[i].filetype=='text') {
                file_id=jsonObj.files[i].id;
                //console.log(`would delete: ${file_id}`);
                console.log(`delete id: ${jsonObj.files[i].id}, name: ${jsonObj.files[i].name} , type: ${jsonObj.files[i].filetype}`);
                let myval = bot.api.files.delete({
                  token: process.env.BOT_TOKEN,
                  file: file_id
                },(err,res) => {
                  if (err) {
                    console.log(`${err.message}`);
                  }
                }).catch((err) => {
                  console.log(err.message);
                }); 
              }
            }            
          }  //endif for jsonObj validity check
      }).catch(err => {
        console.log(`filelist error handler: ${err.message}`);
      });
    }); //end of file delete
  
    //######################################################
    // Call of Slack API files.list 
    //######################################################
    controller.hears(/^\**filelist\**\s*$/, ['message','direct_message'], async function(bot, message) {
      let user_id = null,channel_id=null;
      user_id = message['incoming_message']['from']['id'];
      channel_id = message['incoming_message']['channelData']['channel'];
      //console.log(`** in files.list call from ${user_id} in channel ${channel_id}`);  

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
            for (let i = 0; i < jsonObj['files'].length;i++)
            //for (let i = 0 ; i < 5;i++)
            {
              sb.push(`${i}, id: ${jsonObj.files[i].id}, name: ${jsonObj.files[i].name} , type: ${jsonObj.files[i].filetype}, url_priv_dl: ${jsonObj.files[i]['url_private_download']}`);
            }            
            let myval = bot.replyEphemeral(message,{
              blocks: [
              {
                "type":"section",
                "text":{
                  "type":"mrkdwn",
                  "text": "```" + sb.join('\n') + "```"
                }
              }]
            }).catch((err) => {
              console.log(err.message);
            }); //end bot.replyEphemeral
          }  //endif for jsonObj validity check
      }).catch(err => {
        console.log(`filelist error handler: ${err.message}`);
      });
    }); //end of filelist handler

    //######################################################
    // textxl, simple excel file test
    //######################################################
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

    //######################################################
    // testpdf, simple pdf file test
    //######################################################
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
  
    //######################################################
    // myid retrieves the user_id and channel of user invoking it
    //######################################################
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
    });  //end of controller.hears() for myid
  
    //######################################################
    // Vendor(s) command 
    //######################################################
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
    });  //end of controller.hears() for vendor
  
    //######################################################
    // HELP command 
    //######################################################
    controller.hears(/^[hH][eE][lL][pP]\s*$/, ['message','direct_message'], async function(bot, message) {
/*      fs.writeFile(__dirname + '/direct_msg.json',JSON.stringify(message),(err) => {
        if (err) throw err;
        console.log('file written');
      }); */
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
    }); //end of controller.hears() for help

    //######################################################
    // idlookup command 
    // https://api.slack.com/methods/users.lookupByEmail
    // BOLDED:   *idlookup* *<mailto:norman@normstorm.com|norman@normstorm.com>*
    // REGULAR: idlookup <mailto:norman@normstorm.com|norman@normstorm.com>
    //######################################################
      //regex pattern: idlookup <mailto:norman@normstorm.com|norman@normstorm.com>
    //  controller.hears(/^\**idlookup\s+.*([0-9A-Za-z\-\.]+\@[A-Za-z]+\.com)\>\**$/, ['message','direct_message'], 
    controller.hears(/^\**idlookup/, ['message','direct_message'], 
                    async function(bot, message) {
                      console.log(message.text);
     //                 console.log(message.matches[0]);
      //                console.log(message.matches[1]);
                      
      await bot.api.users.lookupByEmail({
        token: process.env.BOT_TOKEN, 
        email: "norman@normstorm.com"
      }).then((res) =>{
        let sb = [];
        sb.push(`user_id  : ${res['user']['id']}`);
        sb.push(`name     : ${res['user']['name']}`);
        sb.push(`real_name: ${res['user']['real_name']}`);
        sb.push(`email    : ${res['user']['profile']['email']}`);

        console.log(sb.join('\n'));
        /*
        bot.replyEphemeral(message,{
          blocks: [
          {
            "type":"section",
            "text":{
              "type":"mrkdwn",
              "text": "```"+sb.join('\n')+"```"
            }
          }]
        }); //end of replyEphemeral
        */
      }).catch((err) => {
        if (err) {
          console.log(err.message);
        }
      });

    }); //end of controller.hears() for help
} //end of module.exports


// await bot.startConversationWithUser(user); //https://botkit.ai/docs/v4/core.html
