// Import dotenv to load environment variables
import dotenv from 'dotenv';
import { sendTestEmail } from '../lib/nodemailer';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function runTest() {
    try {
        console.log('Sending test email...');
        const result = await sendTestEmail();

        if (result.success) {
            console.log('✅ Email sent successfully!');
            console.log('Message ID:', result.data.id);
        } else {
            console.error('❌ Failed to send email:', result.error);
        }
    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

// Run the test
runTest(); 