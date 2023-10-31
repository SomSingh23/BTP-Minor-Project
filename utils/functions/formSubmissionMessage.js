let formSubmitMessage = (username) => {
  return new Promise((resolve, reject) => {
    resolve(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registration Confirmation</title>
        <style>
          
    
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
    
            .header {
                background-color: #007bff;
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }
    
            .header h1 {
                font-size: 24px;
                margin: 0;
            }
    
            .content {
                padding: 30px;
                color: #333;
                text-align: left;
            }
    
            .verification {
                font-weight: bold;
                display: inline-block;
                color: #007bff;
            }
    
            .footer {
                margin-top: 20px;
                text-align: center;
                color: #777;
            }
    
           
            a {
                color: #007bff;
                text-decoration: underline;
            }
    
            
            @media screen and (max-width: 600px) {
                .container {
                    width: 100%;
                }
                .header {
                    padding: 20px 10px;
                }
                .content {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Registration Form Filled</h1>
            </div>
            <div class="content">
                <p>Dear ${username},</p>
                <p>Thank you for filling out the registration form. Your registration is nearly complete, and we appreciate your interest in our services.</p>
                <p>The verification process involves three steps:</p>
                <ol>
                    <li><div class="verification">Verification 1:</div> By Warden</li>
                    <li><div class="verification">Verification 2:</div> By Academic Section</li>
                    <li><div class="verification">Verification 3:</div> By Assigned Faculty</li>
                </ol>
                <p>Please be patient as the verification process may take up to 1-2 business days. You will receive email notifications after each step is completed. A final confirmation email will be sent once all verifications are successful.</p>
                <p>If you have any questions or need assistance, please contact our support team at <a href="mailto:8fd9k.test@inbox.testmail.app">8fd9k.test@inbox.testmail.app</a>.</p>
                <p>Thank you for choosing us!</p>
            </div>
            <div class="footer">
                <p>&copy; 2023 Som Singh Lodhi</p>
            </div>
        </div>
    </body>
    </html>
    
    `);
  });
};

module.exports = formSubmitMessage;
