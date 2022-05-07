# Sheet-apify

## Description

An website applicate that allow people to generate webisite from google sheets. This is build with MERN stack. This is the codebase for the MongoDB NodeJS and Express RESTful backend API.

This is the graduation project for the full-stack web dev course @CoderSchoolVn

## Features

### CRUD with admin user

1. Admin can create account with email and password
2. Admin can login with email and password
3. Admin can see a list of all admins in own website
4. Admin can see other admin with same website's information by id
5. Admin can see own user's information
6. Owner can update own account profile
7. Owner can deactivate own account
8. Owner can update password

### CRUD with website user

1. User can create account with email and password
2. User can login with email and password
3. Owner can see own user's information
4. Owner can update own account profile
5. Owner can deactivate own account
6. Owner update password

### CRUD with website

1. Create website
2. Get data to render website
3. Update website
4. Delete website
5. Get comment/update vote from fe and save to be
6. Admin can see list of their own websites.

## Production API

- [Doc]

- [App demo]

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
