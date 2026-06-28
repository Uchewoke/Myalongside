import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community Guidelines — MyAlongside" };

export default function CommunityGuidelinesPage() {
  return (
    <>
      <h1>Community Guidelines</h1>
      <p className="lead">Last updated: 26 June 2026</p>
      <p>
        MyAlongside is built around a simple belief: that people who have been through hard things are
        uniquely equipped to help others facing the same. These guidelines exist to protect that space —
        to keep it honest, safe, and genuinely supportive for everyone.
      </p>
      <p>
        By participating in the community — posts, comments, messages, or any interaction — you agree
        to uphold these standards.
      </p>

      <h2>Our Core Values</h2>
      <ul>
        <li><strong>Empathy first.</strong> Lead with compassion, not judgement.</li>
        <li><strong>Lived experience, not advice.</strong> Share what helped you — don&rsquo;t prescribe it.</li>
        <li><strong>Confidentiality.</strong> What&rsquo;s shared here, stays here.</li>
        <li><strong>Honesty.</strong> Be authentic about who you are and what you&rsquo;ve been through.</li>
        <li><strong>Safety above all.</strong> If someone is at risk, act — see our <a href="/legal/safety">Safety page</a>.</li>
      </ul>

      <h2>What We Encourage</h2>
      <ul>
        <li>Sharing your own story, struggles, and breakthroughs</li>
        <li>Asking questions and being genuinely curious about others&rsquo; experiences</li>
        <li>Offering support without expectation of anything in return</li>
        <li>Celebrating small wins — yours and others&rsquo;</li>
        <li>Acknowledging when something is beyond your experience and directing people to professionals</li>
      </ul>

      <h2>What We Do Not Allow</h2>

      <h3>Harmful or abusive content</h3>
      <ul>
        <li>Harassment, bullying, or targeted attacks on any user</li>
        <li>Hate speech based on race, religion, gender, sexuality, disability, or any other characteristic</li>
        <li>Threats of any kind, direct or implied</li>
        <li>Content that glorifies or encourages self-harm, suicide, or harm to others</li>
      </ul>

      <h3>Misinformation and harmful advice</h3>
      <ul>
        <li>Presenting yourself as a licensed doctor, therapist, counsellor, or lawyer if you are not</li>
        <li>Giving specific medical, psychological, legal, or financial advice</li>
        <li>Sharing unverified health information as fact</li>
        <li>Discouraging someone from seeking professional help when they need it</li>
      </ul>

      <h3>Spam and commercial activity</h3>
      <ul>
        <li>Advertising products, services, or external platforms</li>
        <li>Posting repetitive or unsolicited promotional content</li>
        <li>Soliciting payment from other users outside the platform</li>
        <li>Recruiting users to other services</li>
      </ul>

      <h3>Privacy violations</h3>
      <ul>
        <li>Sharing another user&rsquo;s personal information without consent (&ldquo;doxxing&rdquo;)</li>
        <li>Screenshotting or sharing private conversations publicly</li>
        <li>Attempting to identify anonymous users</li>
      </ul>

      <h2>Anonymous Mode</h2>
      <p>
        We support anonymous participation. If you choose to post anonymously, other users and
        moderators cannot identify you by name. However, anonymity does not exempt you from these
        guidelines — we retain technical identifiers for safety and moderation purposes.
      </p>

      <h2>Moderator Decisions</h2>
      <p>
        Our moderation team reviews reported content and may remove posts, issue warnings, restrict
        accounts, or permanently ban users who violate these guidelines. Decisions are made in good
        faith and are final, though you may appeal by emailing <strong>safety@myalongside.com</strong>.
      </p>

      <h2>How to Report</h2>
      <p>
        If you see content that violates these guidelines, use the report button on any post or
        message. For urgent safety concerns, email <strong>safety@myalongside.com</strong> directly.
        We review all reports and take action where warranted — usually within 24 hours.
      </p>

      <h2>Consequences</h2>
      <table>
        <thead>
          <tr>
            <th>Severity</th>
            <th>Example</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Minor</td>
            <td>Accidental spam, borderline advice</td>
            <td>Warning + content removal</td>
          </tr>
          <tr>
            <td>Moderate</td>
            <td>Repeated violations, harassment</td>
            <td>Temporary suspension (7–30 days)</td>
          </tr>
          <tr>
            <td>Severe</td>
            <td>Hate speech, threats, doxxing</td>
            <td>Permanent ban</td>
          </tr>
          <tr>
            <td>Critical</td>
            <td>Immediate risk of harm</td>
            <td>Instant ban + report to authorities if required</td>
          </tr>
        </tbody>
      </table>

      <h2>Questions?</h2>
      <p>
        Reach out to our community team at <strong>community@myalongside.com</strong>. We&rsquo;re
        human and we&rsquo;re here to help.
      </p>
    </>
  );
}
