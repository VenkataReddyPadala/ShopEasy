import React from "react";
import "../pageStyles/ContactUs.css";

function ContactUs() {
  return (
    <div className="contact-container">
      <header className="contact-header">
        <h1>Contact Our Support Network</h1>
        <p>
          Have an issue with your checkout pipeline, shipping status, or a item
          return?
        </p>
      </header>

      <div className="contact-layout">
        {/* Left Side: Informational Message Notice */}
        <div className="contact-notice-wrapper">
          <h2>Get in Touch</h2>
          <p className="notice-lead">
            We are currently upgrading our automated customer support
            infrastructure to serve you better.
          </p>
          <p>
            If you need to report missing items, inquire about payment options,
            update shipping coordinates, or register a claim, please reach out
            directly via our central helpdesk address.
          </p>

          <div className="email-callout-box">
            <h3>Direct Support Email</h3>
            <p className="support-email">support.temp.shop@example.com</p>
            <span className="email-hint">
              Please include your Order ID in the subject line for faster
              routing.
            </span>
          </div>
        </div>

        {/* Right Side: Meta Info Card */}
        <div className="contact-info-wrapper">
          <div className="info-card">
            <h3>Alternative Channels</h3>
            <div className="info-item">
              <span className="info-icon">📍</span>
              <p>
                <strong>Headquarters:</strong> 100 Logistics Blvd, Suite 400,
                Commerce City
              </p>
            </div>
            <div className="info-item">
              <span className="info-icon">📞</span>
              <p>
                <strong>Hotline:</strong> +1 (555) 019-2834
              </p>
            </div>
          </div>

          <div className="info-card operating-hours">
            <h3>Operating Hours</h3>
            <p>
              Our manual ticket review desk processes communications during
              these intervals:
            </p>
            <ul>
              <li>Monday – Friday: 9:00 AM – 6:00 PM EST</li>
              <li>Saturday: 10:00 AM – 4:00 PM EST</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
