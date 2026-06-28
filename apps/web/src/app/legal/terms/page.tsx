import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service — MyAlongside" };

export default function TermsOfServicePage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="lead">Last updated: 26 June 2026</p>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the MyAlongside
        platform. By creating an account or using any part of the service, you agree to be bound by
        these Terms. If you do not agree, do not use the platform.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least <strong>18 years old</strong> to use MyAlongside. By using the platform
        you represent that you meet this requirement and that you have the legal capacity to enter into
        a binding agreement.
      </p>

      <h2>2. Nature of the Service</h2>
      <p>
        MyAlongside is a <strong>peer-support platform</strong>, not a medical, psychological, legal,
        or financial service. Mentors are volunteers sharing lived experience — they are not licensed
        professionals. Nothing on this platform constitutes professional advice of any kind. If you are
        in crisis, please refer to our <a href="/legal/safety">Safety page</a> for emergency resources.
      </p>

      <h2>3. Account Responsibilities</h2>
      <ul>
        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
        <li>You must provide accurate information when creating your account.</li>
        <li>You may not create accounts for other people or impersonate anyone.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>Notify us immediately at <strong>support@myalongside.com</strong> if you suspect unauthorised access.</li>
      </ul>

      <h2>4. Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Harass, threaten, or harm other users in any way</li>
        <li>Share another user&rsquo;s private information without their consent</li>
        <li>Promote commercial products, services, or solicitations (&ldquo;spam&rdquo;)</li>
        <li>Impersonate a licensed professional or claim credentials you do not hold</li>
        <li>Attempt to circumvent platform security or gain unauthorised access</li>
        <li>Post content that is illegal, defamatory, or violates third-party rights</li>
        <li>Use the platform to recruit users to competing or external services</li>
      </ul>
      <p>
        Violations may result in immediate account suspension or permanent termination at our sole
        discretion.
      </p>

      <h2>5. Mentor Responsibilities</h2>
      <p>Mentors additionally agree to:</p>
      <ul>
        <li>Share only from their own lived experience and never present themselves as a professional</li>
        <li>Maintain appropriate emotional boundaries with seekers</li>
        <li>Direct seekers to professional resources and our Safety page when a situation warrants it</li>
        <li>Keep seeker communications confidential except where there is a risk of harm</li>
        <li>Not charge seekers any fees outside the platform</li>
      </ul>

      <h2>6. Content Ownership</h2>
      <p>
        You retain ownership of content you create (posts, messages, profile information). By posting
        content, you grant MyAlongside a non-exclusive, royalty-free, worldwide licence to display and
        store that content solely for the purpose of operating the platform. We do not use your personal
        content for AI training without explicit consent.
      </p>

      <h2>7. Subscriptions and Payments</h2>
      <ul>
        <li>Free accounts have access to core matching and messaging features.</li>
        <li>Plus and Pro subscriptions unlock additional features as described at <a href="/upgrade">/upgrade</a>.</li>
        <li>Subscriptions renew automatically. You may cancel at any time from your account settings.</li>
        <li>Refunds are provided at our discretion for unused portions of a billing period if requested within 7 days.</li>
        <li>Prices may change with 30 days&rsquo; notice.</li>
      </ul>

      <h2>8. Termination</h2>
      <p>
        You may delete your account at any time. We may suspend or terminate accounts that violate
        these Terms, with or without notice. Upon termination, your right to use the platform ceases
        immediately. Data deletion follows the timeline described in our Privacy Policy.
      </p>

      <h2>9. Disclaimer of Warranties</h2>
      <p>
        The platform is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranty of any kind, express
        or implied. We do not warrant that the service will be uninterrupted, error-free, or that
        any specific outcome will result from use of the service.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, MyAlongside shall not be liable for any indirect,
        incidental, special, or consequential damages arising from your use of or inability to use the
        platform, even if we have been advised of the possibility of such damages. Our total liability
        to you shall not exceed the amount you paid us in the 12 months preceding the claim.
      </p>

      <h2>11. Governing Law</h2>
      <p>
        These Terms are governed by the laws of England and Wales. Any disputes shall be subject to
        the exclusive jurisdiction of the courts of England and Wales.
      </p>

      <h2>12. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be communicated by email
        and in-app notification at least 14 days before they take effect. Continued use constitutes
        acceptance.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these Terms? Contact us at <strong>legal@myalongside.com</strong>.
      </p>
    </>
  );
}
