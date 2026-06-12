import React from "react";
import "../pageStyles/AboutUs.css";

function AboutUs() {
  return (
    <div className="about-container">
      <header className="about-header">
        <h1>About Our Store</h1>
        <p className="subtitle">
          Bringing the best products right to your doorstep.
        </p>
      </header>

      <section className="about-content">
        <div className="about-text-section">
          <h2>Our Story</h2>
          <p>
            Founded with a vision to make everyday shopping effortless, our
            platform provides a curated catalog of high-quality items designed
            to meet your daily needs. We bridge the gap between quality
            manufacturers and consumers who value reliability, speed, and
            excellent customer support.
          </p>
          <p>
            From processing secure transactions to handling automated
            distribution tracking, our team monitors every layer of your
            purchasing pipeline to make sure your order arrives safely.
          </p>
        </div>
      </section>

      <section className="about-features">
        <div className="feature-card">
          <div className="feature-icon">🚚</div>
          <h3>Fast Delivery</h3>
          <p>
            Your orders are packed immediately and routed through global
            logistics pipelines for rapid deployment.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Secure Payments</h3>
          <p>
            Shop with complete peace of mind using our enterprise-grade,
            encrypted payment processing setups.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🛠️</div>
          <h3>24/7 Support</h3>
          <p>
            Our designated customer success technicians are available around the
            clock to address any order discrepancies.
          </p>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
