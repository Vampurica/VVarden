# Contributing to Warden
Guide on getting started developing and contributing to the Warden repository.

## Requirements
* [Node.js](https://nodejs.org/en/)

## Installing Node.js
* Download the LTS version of Node.js
* Install it and all of it's features
* In your terminal of choice type `node -v` and after that `npm -v`
* If you don't get a version number you have an issue with your installation

## Setting up a new Discord Application
To use the bot in your local environment you are going to need to set up a new
Discord application which is going to run your bot.

To do this head over to the [Discord Developer Portal](https://discord.com/developers/applications),
in the top right click "New Application" and give it a name.

After doing that go onto the bot tab on the left side and click "Add Bot".

When you're done adding a bot you can go onto the OAuth2 tab on the left side, click on "URL Generator"
then for your scope select "bot" and for it's permissions select "Administrator" and you'll get a 
generated invite link at the bottom that you can use to invite the bot to your server, but first before
inviting the bot to our server we should run it.

## Running the Warden bot
* Clone the repository into your desired location
* Copy and paste the `template.env` file and pasted file to `.env`
* Inside that file fill in the details for your database host
* You can find your bot token in the Bot section on your discord application
* For `CHANNEL_LOG`, `CHANNEL_ADDUSERS` and `DEV` you need to have discord developer mode on
so that you can get the ids of discord channels to put them in and your user id for `DEV` as a string 
* Inside the repository folder open up the terminal of your choice
* Type `npm i`, this will download the node modules
* Import the `structure.sql` file into your database
* To start the bot and watch for changes in the files type `npm run watch` which will also turn on development mode
* To start the bot without watching for changes in files type `node index.js`

You can now use the invite link you generated when creating your bot and invite your bot to the server.

It should automatically import the guild data into the database.

Warden should now start up in your localised environment and by typing `war rank` it should tell you that you are the Bot Owner,
otherwise you didn't set your id correctly for the `DEV` variable in `.env`

You are now free to make and commit changes, do note that every time you make a change and save a file you need to run `node index.js`
so that your changes apply to the bot.
