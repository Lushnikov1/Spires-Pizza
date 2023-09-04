import nodemailer from 'nodemailer'

const sendMail = ({title, text}) =>{
    var transporter = nodemailer.createTransport({
      host: "smtp.mail.ru",
      port: 465,
      secure: true,
        auth: {
          user: 'lika_208@mail.ru',
          pass: 'wFN0jyakuzY5gcLJRrAS'
        }
      });
      
      var mailOptions = {
        from: 'lika_208@mail.ru',
        to: 'lika_208@mail.ru',
        subject: title,
        text: text,
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

export  {sendMail}
