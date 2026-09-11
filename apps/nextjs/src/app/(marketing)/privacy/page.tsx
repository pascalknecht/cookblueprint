import React from "react";

// Structure and rights language adapted from Basecamp's open-source privacy
// policy (https://github.com/basecamp/policies), licensed under CC BY 4.0.
// Content has been rewritten to describe CookBlueprint's actual data
// practices — nothing here is copied verbatim except the general shape of
// the "Your rights" section.
export default function PrivacyPolicy() {
  return (
    <div className="container prose dark:prose-invert mx-auto max-w-4xl px-4 py-16">
      <h1>Privacy Policy</h1>
      <p>
        <em>Last updated: [DATE — fill in when you publish this]</em>
      </p>

      <p>
        This policy explains what personal data CookBlueprint collects, why,
        who we share it with, and the rights you have over it. We don&apos;t
        sell your data, and we don&apos;t run ads or third-party analytics in
        the app.
      </p>

      <p>
        CookBlueprint is operated by [YOUR NAME / LEGAL ENTITY NAME]
        (&quot;we&quot;, &quot;us&quot;). If you have questions about this
        policy or your data, contact us at{" "}
        <a href="mailto:privacy@cookblueprint.com">
          privacy@cookblueprint.com
        </a>{" "}
        <em>
          (placeholder — replace with a real inbox you actually monitor
          before publishing this policy).
        </em>
      </p>

      <h2>What we collect and why</h2>

      <h3>Account information</h3>
      <p>
        When you create a CookBlueprint account, we collect your name, email
        address, and a password (stored as a salted hash — we never see or
        store your password in plain text). If you add a profile picture, we
        store that too. We use this to identify your account, let you sign
        in, and send you account-related email (verifying your address,
        resetting your password).
      </p>

      <h3>Household content</h3>
      <p>
        The recipes, meal plans, and shopping list items you create are
        stored on our servers and shared with everyone in your household
        (the people you&apos;ve invited into your CookBlueprint household).
        This is the core content of the app — it&apos;s not shared outside
        your household, and we don&apos;t use it for advertising.
      </p>
      <p>
        If you import a recipe from a link, your device fetches that page
        directly (over your own internet connection) and reads its recipe
        information locally — the URL isn&apos;t sent through our servers or
        to any AI service for this feature.
      </p>
      <p>
        If you use CookBlueprint without an account (&quot;local mode&quot;),
        this content stays only on your device until you create an account
        and it&apos;s copied up to our servers.
      </p>

      <h3>Recipe photos</h3>
      <p>
        If you take or choose a photo for a recipe, our apps request access
        to your camera or photo library to do that. This is always your
        choice — you can add a recipe without a photo. Uploaded photos are
        stored with an image hosting provider (see &quot;Who we share data
        with&quot; below).
      </p>

      <h3>Session and device information</h3>
      <p>
        When you sign in, we store a session record that includes the IP
        address and browser/device information (user agent) used to create
        it, for as long as that session is active. This helps us detect
        suspicious activity and keep accounts secure. On mobile, your session
        is also stored securely on your device so you stay signed in, and
        (if you use the home-screen widgets) a copy of it is stored in a
        space shared between the app and its widget, on your device only, so
        the widget can fetch your meal plan and shopping list without you
        having to sign in twice.
      </p>

      <h3>Purchases and subscriptions</h3>
      <p>
        CookBlueprint Pro purchases are handled entirely by Apple&apos;s App
        Store or Google&apos;s Play Store — we never see or store your
        payment card details. We use RevenueCat to keep track of which
        subscriptions are active. RevenueCat receives your CookBlueprint
        account ID and your purchase/subscription history from Apple or
        Google so we can unlock Pro features for your account.
      </p>

      <h3>Correspondence</h3>
      <p>
        If you email us for support, we keep that correspondence — including
        your email address — so we have a history to refer back to if you
        write again.
      </p>

      <h3>Children</h3>
      <p>
        CookBlueprint is not directed at children under 13, and we don&apos;t
        knowingly collect personal information from them. If you believe a
        child has provided us with personal information, contact us and
        we&apos;ll delete it.
      </p>

      <h2>Who we share data with</h2>
      <p>
        We use a small number of service providers to run CookBlueprint.
        Each only receives the data it needs to do its job, and none of them
        are permitted to use your data for their own purposes:
      </p>
      <ul>
        <li>
          <strong>Resend</strong> — sends account emails (verification,
          password reset) on our behalf. Receives your email address and the
          email content.
        </li>
        <li>
          <strong>RevenueCat</strong> — manages in-app purchases and
          subscription status. Receives your account ID and
          purchase/subscription data from Apple/Google.
        </li>
        <li>
          <strong>OpenAI</strong> — powers the optional &quot;auto-generate
          my week&quot; meal-planning feature. Receives your household&apos;s
          recipe titles, ingredients, and meal-plan history — not your name,
          email, or any other account information.
        </li>
        <li>
          <strong>DigitalOcean</strong> — stores recipe photos you upload.
        </li>
        <li>
          <strong>Vercel</strong> — hosts our website and API. Like any web
          host, it processes standard connection data (such as IP address)
          to serve requests.
        </li>
        <li>
          A <strong>database host</strong> for the Postgres database that
          stores everything described above.
        </li>
      </ul>
      <p>
        We don&apos;t use any advertising networks, and we don&apos;t run
        analytics or crash-reporting tools in the app.
      </p>
      <p>
        We may also disclose information if required to comply with a valid
        legal process (such as a court order or subpoena), or to protect the
        rights, property, or safety of CookBlueprint, our users, or others.
        If CookBlueprint is ever acquired or merged with another company,
        we&apos;ll notify you before your information is transferred or
        becomes subject to a different privacy policy.
      </p>

      <h2>Your rights</h2>
      <p>
        Wherever you&apos;re located, we aim to give you the same set of
        rights over your data:
      </p>
      <ul>
        <li>
          <strong>Access.</strong> You can ask us what personal data we hold
          about you.
        </li>
        <li>
          <strong>Correction.</strong> You can update your name, email, and
          profile picture at any time in the app&apos;s account settings.
        </li>
        <li>
          <strong>Deletion.</strong> You can delete your account at any time
          from the app (Settings → Preferences → Log out, or the account
          deletion option in Edit Account) or on the web. This deletes your
          account, sessions, and login credentials. Recipes, meal plans, and
          shopping list items belonging to a household aren&apos;t deleted
          automatically if other members remain in it, since that content is
          shared — contact us if you&apos;d like household content removed
          as well.
        </li>
        <li>
          <strong>Portability.</strong> You can ask us for a copy of your
          data in a portable format.
        </li>
        <li>
          <strong>Objection / restriction.</strong> You can ask us to stop
          processing your data in certain circumstances, subject to legal
          limitations (for example, we need some data to keep providing the
          service to you).
        </li>
      </ul>
      <p>
        To exercise any of these rights, email us at{" "}
        <a href="mailto:privacy@cookblueprint.com">
          privacy@cookblueprint.com
        </a>
        . We may need to verify your identity before acting on a request. If
        you&apos;re in the EEA or UK, you also have the right to lodge a
        complaint with your local data protection authority.
      </p>

      <h2>How we secure your data</h2>
      <p>
        Data is encrypted in transit (HTTPS/TLS) between your device and our
        servers. Passwords are stored as salted hashes, never in plain text.
        Access to production systems is limited to what&apos;s needed to
        operate the service.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep your account data for as long as your account is active.
        When you delete your account, your personal account data (profile,
        sessions, login credentials) is deleted promptly; backups that
        include it are cleared on our normal backup rotation schedule.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. If we make a
        significant change, we&apos;ll update the date at the top of this
        page and, where appropriate, notify you in the app.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions, comments, or concerns about this policy or your data?
        Email{" "}
        <a href="mailto:privacy@cookblueprint.com">
          privacy@cookblueprint.com
        </a>
        .
      </p>
    </div>
  );
}
