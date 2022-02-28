# Project Title: PayMates

### Team Members:

Keshavaa Shaiskandan <br>
Ammar Tariq <br>
Tanzim Ahmed

### Description of Application:

The purpose of this application is to give roommates an easy and effective way to log household costs and split them up between each other as well. Users will be able to login to our application and create groups for their roommates to join. They can then simply create notes on the home page, or log costs and choose which roommates to include in the cost. There will also be a payment integration so users can directly clear their debts to their roommates through the application. 


Additional features are described below, but this is the main gist and purpose of our application.


### Key features completed by Beta Version:

1) User authentication including login, register, secured endpoints.
2) Managing Groups - Creating groups, adding roomates, updates/deletes.
3) Canvas View - Creating posts, moving them around, updates/deletes.
4) Logging Costs - UI and logic for distributing costs between roommates.  

### Key features completed by Final Version:
1) Support secure payments using Stripe API so that users in the same group can pay the balance they owe.
2) Make canvas have live updates. Users are able to post on the canvas and group memebers will be able to instantly see the canvas update with the post.
3) [Optional] Make update profile view for users to personalize profiles (possibly change name/email/password/profile picture).
4) [Optional] Support forgot password and allow users to securely update password.
5) [Optional] Support image upload for posts.

### Tech Stack:
1) M - MongoDB to store data
2) E - Express JS to support Node JS backend server
3) R - React JS to create interactive UIs
4) N - Node JS to create backend server
5) G - GraphQL for data exchange b/w client and server
6) Docker to modularize application
7) [Optional] AWS S3 to store images and files


### Top 5 Technical Challenges:

1) Integrating Stripe API and payments securely into our application
2) Architecure of overall application as in, designing GraphQl models, authorizing mutations, defining public & private queries. The overall architecture can make or break this project, since careless decisions early in the development process can become costly later on.
3) Deployment of application either using Docker or purely through Heroku, can be difficult to deploy if backend and frontend are separate along with other containers possibly
4) Building canvas like frontend view and integrating it with the API to fetch/create posts and other backend actions tied closely with the frontend
5) Full integration of our tech stack into our application, we plan to use AWS S3 for image/file storage which can become difficult if integration isn't easily doable. 
