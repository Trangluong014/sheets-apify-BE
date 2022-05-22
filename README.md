# Sheet-apify

## Description

An applicate that allow people to generate website from google sheets. This is build with MERN stack. This is the codebase for the MongoDB NodeJS and Express RESTful backend API.

This is the graduation project for the full-stack web dev course @CoderSchoolVn

## Features

### CRUD with admin user / website user

1. User can create account with email and password

2. User can login with email and password

3. User can see own user's information

4. Owner can update own account profile

5. Owner can deactivate own account

6. Owner can update password

### CRUD with website

1.  Create Website and Items belong to the website

2.  Get List of Websites with information of each website

3.  Get single website with information

4.  Owner can delete own Website and all data belong to this website.

5.  Owner can update own Website information

6.  Owner can update own Website data

#### Working with Google Sheet API and Google Drive API

1.  Redirect Google Account O2Auth Login and
    get accesstoken to Google Drive and Google Spreadsheet

2.  Get List of Sheets in a spreadsheet:

3.  Receive data from front-end and update current row in spreadsheet as well as update in Mongodb Database

4.  Receive data from front-end and add new row to spreadsheet as well as add to Mongodb database

#### website items

1. Get all Items of a website with sort, search, filter, pagination
2. Get single Item of a website

## Production API

- [Doc](https://app.swaggerhub.com/apis/sheets-apify/sheets-apify/1.0.0-oas3)

- [App demo](https://sheetsapify-dashboard.netlify.app/)

## Project setup

1. Generate express boiler plate

   ```console
   npx express-generator --no-view
   npm install
   touch .gitignore .env
   heroku local -p 8000
   ```

2. Install project dependencies

   ```console
   npm i nodemon cors bcryptjs dotenv
   npm i jsonwebtoken mongoose
   npm i googleapis
   npm install express-validator
   npm i alphanumeric-encoder
   ```

3. Add dev script

   ```json
   {
       "scripts":{
           ...
           "dev":"nodemon ./bin/www"
       }
   }
   ```

## The end

@copyright by Trang Luong
