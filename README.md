# PodiumPapers
A better certificate generator for iRacing

This was a closed source project which ran on podiumpapers.com, but the upkeep became too expensive.

I moved all of the backend logic which ran on AWS in Lambdas with SQS/SNS queues and DynamoDB as a storage mechanism and moved it to client side only execution.

Once you run the website locally, you will need to provide either an active iRacing username and password or an encoded token based on an active iRacing username and password.

Obviously feel free to read the code to ensure that I (or no one else) is doing anything nefarious with your password and that it is exclusively held within your browser... or don't... I don't really care.

Enjoy.

## Instructions

1. Clone the repo
2. `npm i`
3. `npm start`
4. Open https://localhost:8080
5. Enter a valid iRacing username and password
6. Enter the race details that you want a certificate generated

If a specific series logo is not available, get the latest versions from iRacing directly and use the custom logo option - https://www.iracing.com/resources/logos/