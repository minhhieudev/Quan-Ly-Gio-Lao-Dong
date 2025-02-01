import nodemailer from 'nodemailer';
import { connectToDB } from '@mongodb';
import User from "@models/User";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "bebopa37931@gmail.com",
    pass: "mnpg yuib avjp cwhw",
  },
});

export const POST = async (req) => {
  try {
    await connectToDB();
    const { idUser, subject, text, attachments } = await req.json();

    // Fetch the list of users excluding the current user
    const users = await User.find().select('email');
    const emails = users
      .filter(user => user._id.toString() !== idUser)
      .map(user => user.email);

    const mailOptions = {
      from: "TRƯỜNG ĐẠI HỌC PHÚ YÊN",
      to: emails.join(', '),
      subject: subject || 'Default Subject',
      text: text || 'Default Email Body',
      attachments: attachments,
    };

    try {
      await transporter.sendMail(mailOptions);
      return new Response('Emails sent successfully', { status: 200 });
    } catch (error) {
      console.error('Failed to send emails:', error);
      return new Response(`Failed to send emails: ${error.message}`, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
};
