import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy — MyAlongside" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="lead">Last updated: 26 June 2026</p>
      <p>
        MyAlongside (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy.
        This policy explains what personal data we collect, why we collect it, and your rights over it.
        Because this platform deals with sensitive life experiences, we treat your data with the highest
        level of care.
      </p>

      <h2>1. Who We Are</h2>
      <p>
        MyAlongside is a peer-mentorship platform that connects people navigating difficult life events
        with mentors who have lived through similar experiences. We are not a medical or mental health
        provider; see our <a href="/legal/safety">Safety page</a> for crisis resources.
      </p>

      <h2>2. Data We Collect</h2>
      <h3>Account information</h3>
      <ul>
        <li>Name, email address, and password (stored as a secure hash)</li>
        <li>Role (Seeker or Mentor) and profile details you provide (bio, location, languages)</li>
        <li>Life events you select — these are treated as <strong>sensitive personal data</strong></li>
      </ul>
      <h3>Usage data</h3>
      <ul>
        <li>Messages exchanged between seekers and mentors (end-to-end within our platform)</li>
        <li>Community posts, likes, and comments you make</li>
        <li>Session tokens and device information for security purposes</li>
        <li>Log data such as IP addresses and browser type (retained for 30 days)</li>
      </ul>
      <h3>Payment data</h3>
      <p>
        Subscription payments are processed by Stripe. We store only your Stripe customer ID;
        full card details are never held by us.
      </p>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li><strong>Matching:</strong> Life event selections power our mentor-matching algorithm.</li>
        <li><strong>Communication:</strong> Messages are stored to provide the in-app chat experience.</li>
        <li><strong>Safety:</strong> We review reported content and may share information with authorities if there is an immediate risk of harm.</li>
        <li><strong>Product improvement:</strong> Aggregated, anonymised usage patterns help us improve the platform.</li>
        <li><strong>Legal compliance:</strong> We retain certain data as required by applicable law.</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal data to third parties or use it for advertising.</p>

      <h2>4. Data Retention</h2>
      <ul>
        <li>Account data is retained while your account is active and for 90 days after deletion (to allow recovery).</li>
        <li>Messages are retained for 2 years from the date of the conversation, then permanently deleted.</li>
        <li>Community posts are retained until you delete them or close your account.</li>
        <li>Audit logs are retained for 12 months for security purposes.</li>
      </ul>

      <h2>5. Your Rights</h2>
      <p>Depending on your location, you may have the right to:</p>
      <ul>
        <li><strong>Access</strong> a copy of your personal data</li>
        <li><strong>Correct</strong> inaccurate data</li>
        <li><strong>Delete</strong> your account and associated data</li>
        <li><strong>Export</strong> your data in a machine-readable format</li>
        <li><strong>Restrict</strong> or object to certain processing</li>
        <li><strong>Withdraw consent</strong> at any time where processing is consent-based</li>
      </ul>
      <p>To exercise any of these rights, contact us at <strong>privacy@myalongside.com</strong>. We respond within 30 days.</p>

      <h2>6. Cookies</h2>
      <p>
        We use strictly necessary cookies (authentication session tokens) and no third-party tracking
        or advertising cookies. You cannot opt out of strictly necessary cookies without losing access
        to authenticated features.
      </p>

      <h2>7. Third-Party Services</h2>
      <ul>
        <li><strong>Neon (PostgreSQL):</strong> Database hosting — your data is encrypted at rest and in transit.</li>
        <li><strong>Stripe:</strong> Payment processing — governed by Stripe&rsquo;s own privacy policy.</li>
        <li><strong>Jitsi Meet:</strong> Video calling — calls happen peer-to-peer; we do not record them.</li>
      </ul>

      <h2>8. Security</h2>
      <p>
        We use TLS encryption for all data in transit, bcrypt for password hashing, JWT-based
        authentication with refresh token rotation, and rate limiting on all API endpoints.
        Despite these measures, no system is 100% secure — please choose a strong, unique password.
      </p>

      <h2>9. Children</h2>
      <p>
        MyAlongside is not intended for users under 18 years of age. We do not knowingly collect
        data from minors. If you believe a minor has created an account, contact us immediately.
      </p>

      <h2>10. Changes to This Policy</h2>
      <p>
        We will notify you by email and in-app banner at least 14 days before any material change
        takes effect. Continued use after the effective date constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        <strong>Email:</strong> privacy@myalongside.com<br />
        <strong>Post:</strong> MyAlongside Ltd, Data Protection Officer, London, UK
      </p>
    </>
  );
}
