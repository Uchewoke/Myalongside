import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Safety — MyAlongside" };

export default function SafetyPage() {
  return (
    <>
      <h1>Safety</h1>

      {/* Crisis banner */}
      <div className="not-prose my-6 rounded-2xl border-2 border-red-200 bg-red-50 p-6">
        <p className="text-base font-bold text-red-700">If you or someone else is in immediate danger</p>
        <p className="mt-1 text-sm text-red-600">
          Call your local emergency services (<strong>999</strong> in the UK · <strong>911</strong> in the US ·
          <strong> 112</strong> in the EU) or go to your nearest emergency room immediately.
        </p>
        <p className="mt-3 text-sm font-semibold text-red-700">Crisis lines (free, 24/7):</p>
        <ul className="mt-2 space-y-1 text-sm text-red-600">
          <li><strong>Samaritans (UK):</strong> 116 123 — <a href="tel:116123" className="underline">call</a> or <a href="mailto:jo@samaritans.org" className="underline">jo@samaritans.org</a></li>
          <li><strong>Crisis Text Line (US/UK):</strong> Text HOME to 741741</li>
          <li><strong>988 Suicide &amp; Crisis Lifeline (US):</strong> Call or text <a href="tel:988" className="underline">988</a></li>
          <li><strong>International Association for Suicide Prevention:</strong>{" "}
            <a href="https://www.iasp.info/resources/Crisis_Centres/" className="underline" target="_blank" rel="noopener noreferrer">
              find your local line
            </a>
          </li>
        </ul>
      </div>

      <p>
        MyAlongside is a peer-support platform. We are <strong>not</strong> a crisis service, a
        clinical mental health provider, or a substitute for professional care. This page explains
        how we approach safety, what to do if you&rsquo;re struggling, and how to help someone else.
      </p>

      <h2>If You Are in Crisis Right Now</h2>
      <p>Please do not wait. Reach out to one of the crisis lines above, or:</p>
      <ul>
        <li>Call a trusted person who can be with you immediately</li>
        <li>Go to your nearest emergency department</li>
        <li>Tell your mentor — they are trained to help you find the right support</li>
      </ul>
      <p>
        You can also use the <strong>Report</strong> button on any message to flag a safety concern
        to our team. For urgent situations, email <strong>safety@myalongside.com</strong> — we
        monitor this address and prioritise safety reports.
      </p>

      <h2>If You Are Worried About Someone Else</h2>
      <ul>
        <li>Take it seriously. If someone expresses thoughts of self-harm or suicide, treat it as real.</li>
        <li>Listen without judgement. You don&rsquo;t need to fix anything — your presence matters.</li>
        <li>Ask directly: &ldquo;Are you thinking about ending your life?&rdquo; Asking does not increase risk.</li>
        <li>Help them access support — share the crisis numbers above or offer to call with them.</li>
        <li>Report the conversation to us using the <strong>Report</strong> button or email <strong>safety@myalongside.com</strong>.</li>
        <li>If you believe they are in immediate danger, contact emergency services.</li>
      </ul>

      <h2>Our Platform Limits</h2>
      <p>
        Mentors on MyAlongside are <strong>peer supporters, not professionals</strong>. They are
        not trained counsellors, therapists, social workers, or medical professionals unless they
        explicitly state a professional qualification. Please do not rely on this platform as your
        sole source of support for acute mental health conditions, eating disorders, substance
        dependency, or any situation where professional intervention is indicated.
      </p>
      <p>We strongly encourage all users to maintain a relationship with a qualified professional alongside any peer support they receive here.</p>

      <h2>Safeguarding</h2>
      <p>
        Our safeguarding policy requires mentors and staff to escalate concerns about abuse,
        neglect, or immediate risk of harm — including breaking confidentiality where necessary to
        protect life. We follow the{" "}
        <strong>Children Act 1989</strong>, <strong>Care Act 2014</strong>, and equivalent
        international frameworks.
      </p>
      <p>If you are a professional working with a vulnerable person who uses MyAlongside, contact <strong>safeguarding@myalongside.com</strong>.</p>

      <h2>Content Moderation</h2>
      <p>
        Content that promotes or glorifies self-harm, suicide, eating disorders, or substance
        misuse is removed immediately upon detection or report. Repeat offenders are permanently
        banned. We follow{" "}
        <a href="https://www.samaritans.org/about-samaritans/research-policy/internet-suicide/guidelines-tech-industry/" target="_blank" rel="noopener noreferrer">
          Samaritans&rsquo; media guidelines
        </a>{" "}
        for responsible reporting of suicide and self-harm.
      </p>

      <h2>Looking After Yourself as a Mentor</h2>
      <p>
        Supporting others through difficult experiences can be emotionally demanding. If you are
        feeling overwhelmed, compassion-fatigued, or affected by a seeker&rsquo;s situation:
      </p>
      <ul>
        <li>Pause your availability in <Link href="/settings">Mentor Settings</Link> to take a break</li>
        <li>Reach out to our mentor support team at <strong>mentors@myalongside.com</strong></li>
        <li>Use the same crisis resources listed above — you deserve support too</li>
      </ul>

      <h2>Report a Safety Concern</h2>
      <p>To report a concern about content, a user, or a conversation:</p>
      <ul>
        <li>Use the <strong>Report</strong> button on any post, message, or profile</li>
        <li>Email <strong>safety@myalongside.com</strong> for urgent concerns</li>
        <li>In a life-threatening emergency, always contact your local emergency services first</li>
      </ul>

      <h2>Useful Resources</h2>
      <ul>
        <li><a href="https://www.samaritans.org" target="_blank" rel="noopener noreferrer">Samaritans</a> — emotional support, UK &amp; Ireland</li>
        <li><a href="https://www.mind.org.uk" target="_blank" rel="noopener noreferrer">Mind</a> — mental health information and support, UK</li>
        <li><a href="https://www.nami.org" target="_blank" rel="noopener noreferrer">NAMI</a> — National Alliance on Mental Illness, US</li>
        <li><a href="https://www.beyondblue.org.au" target="_blank" rel="noopener noreferrer">Beyond Blue</a> — mental health support, Australia</li>
        <li><a href="https://www.crisisservicescanada.ca" target="_blank" rel="noopener noreferrer">Crisis Services Canada</a></li>
        <li><a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">findahelpline.com</a> — global directory of helplines</li>
      </ul>
    </>
  );
}
