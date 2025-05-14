import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { notificationService, NotificationChannel, NotificationType } from '@/lib/notification-service';

export async function POST(request: NextRequest) {
  try {
    const { orderId, customerName, customerEmail, customerPhone, items, subtotal, tax, totalAmount, paymentMethod } = await request.json();

    if (!orderId || !customerEmail) {
      return NextResponse.json({ error: 'Order ID and customer email are required' }, { status: 400 });
    }

    // Format currency for display in notification
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount);
    };

    // Get restaurant info
    const restaurantResult = await pool.query('SELECT name, address, phone, email FROM restaurants LIMIT 1');
    const restaurant = restaurantResult.rows[0] || {
      name: 'Our Restaurant',
      address: '123 Main St, City',
      phone: '(555) 123-4567',
      email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    };

    // Format order data for the notification service
    const orderData = {
      orderNumber: orderId.toString(),
      customerEmail,
      customerPhone,
      customerName,
      items: items.map((item: any) => ({
        name: item.menuItemName,
        quantity: item.quantity,
        price: item.price
      })),
      total: totalAmount,
      orderDate: new Date(),
      // Additional data for email template
      formattedItems: items.map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.menuItemName}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.price)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.subtotal)}</td>
        </tr>
      `).join(''),
      subtotal,
      tax,
      totalAmount,
      formattedTotal: formatCurrency(totalAmount),
      formattedSubtotal: formatCurrency(subtotal),
      formattedTax: formatCurrency(tax),
      paymentMethod: paymentMethod === 'card' ? 'Credit/Debit Card' :
        paymentMethod === 'apple' ? 'Apple Pay' :
          paymentMethod === 'google' ? 'Google Pay' : 'Online Payment',
      restaurantName: restaurant.name,
      restaurantAddress: restaurant.address,
      restaurantPhone: restaurant.phone,
      restaurantEmail: restaurant.email,
      orderDate: new Date().toLocaleDateString()
    };

    // Send through notification service (both email and WhatsApp if phone number is provided)
    const notificationResults = await notificationService.sendOrderConfirmation(orderData);

    // Check if at least the email notification was sent successfully
    const emailResult = notificationResults.find(result => result.channel === NotificationChannel.EMAIL);

    if (emailResult && emailResult.success) {
      // Update the order with email sent status
      await pool.query(
        `UPDATE orders SET email_sent = true WHERE id = $1`,
        [orderId]
      );
    }

    // If WhatsApp notification was sent and successful, update database
    const whatsappResult = notificationResults.find(result => result.channel === NotificationChannel.WHATSAPP);
    if (whatsappResult && whatsappResult.success && customerPhone) {
      await pool.query(
        `UPDATE orders SET whatsapp_sent = true WHERE id = $1`,
        [orderId]
      );
    }

    // Check overall success
    const allSuccess = notificationResults.every(result => result.success);
    const successCount = notificationResults.filter(result => result.success).length;

    if (allSuccess) {
      return NextResponse.json({
        success: true,
        notifications: notificationResults,
        message: 'Order confirmation notifications sent successfully'
      });
    } else if (successCount > 0) {
      return NextResponse.json({
        success: true,
        notifications: notificationResults,
        message: `${successCount} of ${notificationResults.length} notifications sent successfully`
      });
    } else {
      throw new Error('All notifications failed to send');
    }
  } catch (error) {
    console.error('Error sending order confirmation notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send order confirmation notifications' },
      { status: 500 }
    );
  }
} 