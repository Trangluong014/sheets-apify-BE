const { googleAuth } = require("./helpers/utils");

const func = () => {
  const oauth2Client = googleAuth();
  return console.log(oauth2Client);
};
