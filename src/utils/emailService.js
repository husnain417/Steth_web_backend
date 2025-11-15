// utils/emailService.js
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const path = require('path');

// UPDATED: Using Brevo instead of Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_LOGIN,      // Your SMTP login
    pass: process.env.BREVO_API_KEY     // Your SMTP key
  }
});

// Using verified Gmail address as sender
// Make sure to replace ALL "from" addresses with this verified email

// Email for new verification request to admin
exports.sendVerificationRequestEmail = async (verification, studentEmail) => {
  try {
    const mailOptions = {
      from: '"Steth" <stethhelp@gmail.com>',  // UPDATED - Using verified sender
      to: process.env.EMAIL_ADMIN,
      subject: 'New Student Verification Request',
      html: `
        <h2>New Student Verification Request</h2>
        <p><strong>Student Name:</strong> ${verification.name}</p>
        <p><strong>Institution:</strong> ${verification.institutionName}</p>
        <p><strong>Student ID:</strong> ${verification.studentId}</p>
        <p><strong>Email:</strong> ${studentEmail}</p>
        <p>Please review this request in the admin dashboard.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification request email sent to admin');
  } catch (error) {
    console.error('Error sending verification request email:', error);
  }
};

// Email for verification result to student
exports.sendVerificationResultEmail = async (verification, studentEmail, isApproved) => {
  try {
    const subject = isApproved 
      ? 'Your Student Verification is Approved' 
      : 'Your Student Verification was Rejected';
    
    const message = isApproved
      ? `
        <h2>Student Verification Approved</h2>
        <p>Congratulations! Your student verification for ${verification.institutionName} has been approved.</p>
        <p>You now have access to all student benefits on our platform.</p>
        <p>Thank you for verifying your student status.</p>
      `
      : `
        <h2>Student Verification Rejected</h2>
        <p>We're sorry, but your student verification request has been rejected.</p>
        <p><strong>Reason:</strong> ${verification.rejectionReason || 'No specific reason provided'}</p>
        <p>You may submit a new verification request with updated information if you wish.</p>
      `;

    const mailOptions = {
      from: '"Steth" <9bb143001@smtp-brevo.com>',  // UPDATED
      to: studentEmail,
      subject: subject,
      html: message
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification result email sent to student');
  } catch (error) {
    console.error('Error sending verification result email:', error);
  }
};

// Email for new order notification to admin
exports.sendNewOrderEmailToAdmin = async (order, userEmail) => {
  try {
    // Format order items for better readability
    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.productName || 'Product'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.color || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.size || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">PKR ${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">PKR ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: '"Steth Orders" <9bb143001@smtp-brevo.com>',  // UPDATED
      to: process.env.EMAIL_ADMIN,
      subject: `🔔 New Order #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #dc3545; margin-bottom: 20px; border-bottom: 3px solid #dc3545; padding-bottom: 10px;">🚨 New Order Received</h2>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order._id}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> <span style="background-color: ${order.paymentMethod === 'cash-on-delivery' ? '#d4edda' : '#cce5ff'}; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${order.paymentMethod.toUpperCase()}</span></p>
              ${order.isFirstOrder ? '<p style="margin: 5px 0; color: #28a745;"><strong>🎉 FIRST ORDER - NEW CUSTOMER!</strong></p>' : ''}
            </div>
            
            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #007bff;">
              <h3 style="margin: 0 0 10px 0; color: #004085;">Customer Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${order.shippingAddress.fullName}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${userEmail}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingAddress.phoneNumber}</p>
            </div>
            
            <h3 style="color: #333; margin-top: 30px;">📦 Items Ordered:</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: white;">
              <tr style="background-color: #6c757d; color: white;">
                <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Product</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Color</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Size</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: center;">Quantity</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Unit Price</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: right;">Total</th>
              </tr>
              ${itemsList}
            </table>
            
            <div style="border-top: 3px solid #dc3545; padding-top: 20px; margin-top: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
              <h3 style="color: #dc3545; margin-bottom: 15px;">💰 Order Summary</h3>
              <table style="width: 100%; margin-bottom: 10px;">
                <tr>
                  <td style="text-align: right; padding: 8px 0; font-size: 16px;"><strong>Subtotal:</strong></td>
                  <td style="text-align: right; padding: 8px 0; width: 140px; font-size: 16px;"><strong>PKR ${order.subtotal.toFixed(2)}</strong></td>
                </tr>
                ${order.discount > 0 ? `
                  <tr>
                    <td style="text-align: right; padding: 8px 0; color: #28a745; font-size: 16px;">Discount ${order.discountCode ? `(${order.discountCode})` : ''}:</td>
                    <td style="text-align: right; padding: 8px 0; color: #28a745; font-size: 16px;"><strong>-PKR ${order.discount.toFixed(2)}</strong></td>
                  </tr>
                ` : ''}
                ${order.pointsUsed > 0 ? `
                  <tr>
                    <td style="text-align: right; padding: 8px 0; color: #28a745; font-size: 16px;">Points Used:</td>
                    <td style="text-align: right; padding: 8px 0; color: #28a745; font-size: 16px;"><strong>-PKR ${order.pointsUsed.toFixed(2)}</strong></td>
                  </tr>
                ` : ''}
                <tr>
                  <td style="text-align: right; padding: 8px 0; font-size: 16px;">Shipping Charges:</td>
                  <td style="text-align: right; padding: 8px 0; font-size: 16px;">
                    <strong>${order.shippingCharges > 0 ? `PKR ${order.shippingCharges.toFixed(2)}` : 'Free'}</strong>
                  </td>
                </tr>
                <tr style="border-top: 2px solid #dc3545; background-color: #dc3545; color: white;">
                  <td style="text-align: right; padding: 12px 8px; font-size: 18px;"><strong>FINAL TOTAL:</strong></td>
                  <td style="text-align: right; padding: 12px 8px; font-size: 18px;"><strong>PKR ${order.total.toFixed(2)}</strong></td>
                </tr>
              </table>
            </div>
            
            ${order.pointsEarned > 0 ? `
              <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #17a2b8;">
                <p style="margin: 0; color: #0c5460; font-size: 16px;"><strong>💎 Customer earned ${order.pointsEarned} reward points from this purchase!</strong></p>
              </div>
            ` : ''}
            
            ${order.paymentMethod === 'bank-transfer' && order.paymentReceipt ? `
              <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
                <h4 style="margin: 0 0 10px 0; color: #721c24;">🏦 Payment Receipt Uploaded</h4>
                <p style="margin: 0; color: #721c24;">Customer has uploaded a payment receipt. Please verify the payment before processing the order.</p>
                ${order.paymentReceipt.url ? `<p style="margin: 10px 0 0 0;"><a href="${order.paymentReceipt.url}" target="_blank" style="color: #007bff; text-decoration: none;">📎 View Payment Receipt</a></p>` : ''}
              </div>
            ` : ''}
            
            <div style="background-color: #e2e3e5; padding: 20px; border-radius: 5px; margin: 25px 0;">
              <h3 style="color: #495057; margin: 0 0 15px 0;">📍 Shipping Address</h3>
              <div style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #6c757d;">
                <p style="margin: 0; line-height: 1.6; font-size: 16px;">
                  <strong>${order.shippingAddress.fullName}</strong><br>
                  ${order.shippingAddress.addressLine1}<br>
                  ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                  ${order.shippingAddress.country}<br>
                  📞 <strong>Phone:</strong> ${order.shippingAddress.phoneNumber}
                </p>
              </div>
            </div>
            
            <div style="margin: 30px 0; padding: 20px; background-color: #dc3545; color: white; border-radius: 5px; text-align: center;">
              <h3 style="margin: 0 0 10px 0;">⚡ ACTION REQUIRED</h3>
              <p style="margin: 0; font-size: 16px;"><strong>Please process this order in the admin dashboard immediately.</strong></p>
              ${order.paymentMethod === 'bank-transfer' ? '<p style="margin: 10px 0 0 0; font-size: 14px;">⚠️ Verify payment receipt before processing!</p>' : ''}
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #6c757d; margin: 0; font-size: 14px;">
                <em>Steth Admin Notification System</em><br>
                Order received at ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('New order email sent to admin');
  } catch (error) {
    console.error('Error sending order email to admin:', error);
  }
};

// Continue with rest of functions... (character limit, showing pattern)
// Update ALL other email functions the same way:
// Change: from: process.env.EMAIL_STETH
// To: from: '"Steth" <9bb143001@smtp-brevo.com>'

exports.sendOrderConfirmationToCustomer = async (order, userEmail) => {
  try {
    const itemsList = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.productName || 'Product'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.color || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.size || 'N/A'}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">PKR ${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">PKR ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: '"Steth" <9bb143001@smtp-brevo.com>',  // UPDATED
      to: userEmail,
      subject: `Order Confirmed #${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Thank You for Your Order!</h2>
          <p>Hi ${order.shippingAddress.fullName},</p>
          <p>We have received your order and are processing it. Here's a summary of your purchase:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          </div>
          
          <h3 style="color: #333;">Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Product</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Color</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Size</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Quantity</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Unit Price</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total</th>
            </tr>
            ${itemsList}
          </table>
          
          <div style="border-top: 2px solid #333; padding-top: 15px; margin-top: 20px;">
            <table style="width: 100%; margin-bottom: 10px;">
              <tr>
                <td style="text-align: right; padding: 5px 0;"><strong>Subtotal:</strong></td>
                <td style="text-align: right; padding: 5px 0; width: 120px;"><strong>PKR ${order.subtotal.toFixed(2)}</strong></td>
              </tr>
              ${order.discount > 0 ? `
                <tr>
                  <td style="text-align: right; padding: 5px 0; color:hsl(134, 61.40%, 40.60%);">Discount ${order.discountCode ? `(${order.discountCode})` : ''}:</td>
                  <td style="text-align: right; padding: 5px 0; color: #28a745;">-PKR ${order.discount.toFixed(2)}</td>
                </tr>
              ` : ''}
              ${order.pointsUsed > 0 ? `
                <tr>
                  <td style="text-align: right; padding: 5px 0; color: #28a745;">Points Used:</td>
                  <td style="text-align: right; padding: 5px 0; color: #28a745;">-PKR ${order.pointsUsed.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="text-align: right; padding: 5px 0;">Shipping:</td>
                <td style="text-align: right; padding: 5px 0;">
                  ${order.shippingCharges > 0 ? `PKR ${order.shippingCharges.toFixed(2)}` : 'Free'}
                </td>
              </tr>
              <tr style="border-top: 1px solid #ddd;">
                <td style="text-align: right; padding: 10px 5px 5px 0; font-size: 18px;"><strong>Final Total:</strong></td>
                <td style="text-align: right; padding: 10px 5px 5px 0; font-size: 18px; color: #007bff;"><strong>PKR ${order.total.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
          
          ${order.pointsEarned > 0 ? `
            <div style="background-color: #e8f5e8; padding: 10px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 0; color: #28a745;"><strong>🎉 You earned ${order.pointsEarned} reward points from this purchase!</strong></p>
            </div>
          ` : ''}
          
          <h3 style="color: #333;">Shipping Address:</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">
            <p style="margin: 0;">
              ${order.shippingAddress.fullName}<br>
              ${order.shippingAddress.addressLine1}<br>
              ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
              ${order.shippingAddress.country}<br>
              Phone: ${order.shippingAddress.phoneNumber}
            </p>
          </div>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #f0f8ff; border-radius: 5px;">
            <p style="margin: 0;">We'll notify you when your order ships. You can also check your order status by logging into your account.</p>
          </div>
          
          <p>Thank you for shopping with us!</p>
          <p style="color: #666;"><em>The Steth Team</em></p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to customer');
  } catch (error) {
    console.error('Error sending order confirmation email to customer:', error);
  }
};

// ... Continue updating ALL remaining functions with the same from address pattern