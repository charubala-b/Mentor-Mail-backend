require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},
function (token, tokenSecret, profile, done) {
  // Save user profile and tokens to the database or session
  return done(null, { profile, token });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Define the root route
app.get('/', (req, res) => {
  res.send('Welcome to the Home Page!');
});

// Google OAuth routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/gmail.readonly'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => res.redirect('/emails'));

app.get('/emails', (req, res) => {
  if (!req.user) return res.redirect('/auth/google');

  const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  oAuth2Client.setCredentials({ access_token: req.user.token });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  gmail.users.messages.list({ userId: 'me' }, (err, response) => {
    if (err) return res.status(500).send('The API returned an error: ' + err);
    res.json(response.data);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Catch-all route for handling 404
app.use((req, res) => {
  res.status(404).send('404: Page not found');
});

app.listen(5000, () => console.log('Server is running on port 5000'));
