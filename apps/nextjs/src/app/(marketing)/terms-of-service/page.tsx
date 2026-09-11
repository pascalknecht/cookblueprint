import React from "react";

// Structure adapted from Basecamp's open-source Terms of Service
// (https://github.com/basecamp/policies), licensed under CC BY 4.0. Content
// has been rewritten to describe CookBlueprint's actual product and business
// model — a household recipe/meal-planning app sold as an optional in-app
// purchase through the Apple App Store and Google Play, with no web billing
// or web accounts of its own.
export default function TermsOfServicePage() {
  return (
    <div className="container prose dark:prose-invert mx-auto max-w-4xl px-4 py-16">
      <h1>Terms of Service</h1>
      <p>
        <em>Last updated: [DATE — fill in when you publish this]</em>
      </p>

      <p>
        Thanks for using CookBlueprint! These Terms of Service (&quot;Terms&quot;)
        govern your use of the CookBlueprint mobile app and website. We&apos;ve
        tried to keep them straightforward, but because we don&apos;t know
        every one of our users personally, we still need a real set of rules
        to keep things fair.
      </p>

      <p>
        When we say &quot;CookBlueprint&quot;, &quot;we&quot;, &quot;us&quot;, or
        &quot;our&quot;, we mean [YOUR NAME / LEGAL ENTITY NAME], the operator
        of CookBlueprint. When we say &quot;Services&quot;, we mean the
        CookBlueprint mobile app (iOS and Android) and the cookblueprint.com
        website. When we say &quot;you&quot; or &quot;your&quot;, we mean the
        person using the Services, and — where you&apos;ve invited others into
        a shared household — the household you administer.
      </p>

      <p>
        We may update these Terms from time to time. Whenever we make a
        significant change, we&apos;ll update the date at the top of this page
        and, where appropriate, notify you in the app. Continuing to use
        CookBlueprint after a change means you accept the updated Terms.
        <strong> These Terms include a limitation of our liability, below.</strong>
      </p>

      <h2>Account terms</h2>
      <ul>
        <li>
          You must provide a valid email address to create an account, and
          you&apos;re responsible for keeping your password secure. We can&apos;t
          and won&apos;t be liable for loss or damage from your failure to
          keep your account credentials safe.
        </li>
        <li>
          You&apos;re responsible for all content added to your household —
          recipes, meal plans, and shopping list items — including content
          added by anyone you invite into it.
        </li>
        <li>
          You must be a human. Accounts created by bots or other automated
          means aren&apos;t permitted.
        </li>
        <li>
          You&apos;re responsible for what you invite others to see: inviting
          someone into your household shares your recipes, meal plans, and
          shopping list with them, as described in our{" "}
          <a href="/privacy">Privacy Policy</a>.
        </li>
      </ul>

      <h2>Purchases, subscriptions, and refunds</h2>
      <ul>
        <li>
          The core of CookBlueprint — saving recipes, planning meals, and the
          shared shopping list — is free to use for your whole household.
        </li>
        <li>
          CookBlueprint Pro is an optional subscription purchased entirely
          through Apple&apos;s App Store or Google&apos;s Play Store. We don&apos;t
          process payments or store payment card details ourselves — Apple or
          Google handles billing, renewal, and payment collection according
          to their own terms.
        </li>
        <li>
          Because purchases go through Apple and Google, refunds are handled
          by them, under their own refund policies. We&apos;re not able to
          issue refunds directly — please contact Apple or Google support
          for a purchase made through their store.
        </li>
        <li>
          You can cancel a CookBlueprint Pro subscription at any time from
          your Apple or Google account settings. Cancelling stops future
          renewals; it doesn&apos;t retroactively refund the current period.
          The free features of CookBlueprint keep working either way.
        </li>
      </ul>

      <h2>Cancellation and account deletion</h2>
      <ul>
        <li>
          You can delete your account at any time from the app (Settings →
          Preferences → Edit Account). This is a no-questions-asked,
          self-service action — you don&apos;t need to contact us.
        </li>
        <li>
          Deleting your account removes your login credentials, sessions,
          and profile. As explained in our <a href="/privacy">Privacy Policy</a>,
          recipes, meal plans, and shopping list items belonging to a
          household aren&apos;t deleted automatically if other members remain
          in it, since that content is shared — contact us if you&apos;d like
          shared household content removed as well.
        </li>
        <li>
          We may suspend or terminate access to the Services for anyone who
          violates these Terms, uses the Services for an unlawful purpose, or
          abuses our staff. We&apos;ll do our best to warn you first, except in
          serious cases.
        </li>
      </ul>

      <h2>Modifications to the Service</h2>
      <p>
        We may modify, add to, or discontinue features of the Services at any
        time. We&apos;ll try to give notice for changes that meaningfully
        affect how you use CookBlueprint, but we can&apos;t promise every
        feature will be supported forever.
      </p>

      <h2>Content ownership</h2>
      <ul>
        <li>
          The recipes, meal plans, and shopping list items you and your
          household create remain yours. You give us a limited license to
          store and display that content back to you and your household in
          order to provide the Services — we claim no ownership over it.
        </li>
        <li>
          We (or our licensors) own the CookBlueprint app, website, logos,
          and branding. You don&apos;t get any ownership rights in the
          Services from using them, and you may not copy, reuse, or exploit
          the app&apos;s design, code, or branding without our permission.
        </li>
        <li>
          If you import a recipe from a link, that recipe&apos;s content
          belongs to whoever originally published it — CookBlueprint just
          helps you save a copy of it for your own household&apos;s use.
        </li>
      </ul>

      <h2>Features, bugs, and third-party services</h2>
      <p>
        We build CookBlueprint with care and test it before shipping, but
        like any software it will have bugs, and we can&apos;t guarantee it
        will always meet your specific needs or be error-free. Some features
        (such as recipe imports or auto-generated meal plans) depend on
        third-party websites or services we don&apos;t control, and we&apos;re
        not responsible for their availability or accuracy.
      </p>

      <h2>Liability</h2>
      <p>
        <em>
          To the extent permitted by law, CookBlueprint is not liable for any
          indirect, incidental, special, consequential, or punitive damages,
          or any loss of data, arising from your use of, or inability to use,
          the Services — even if we&apos;ve been advised of the possibility of
          such damages. The Services are provided &quot;as is&quot; and &quot;as
          available&quot;, without warranties of any kind.
        </em>
      </p>
      <p>
        In other words: we do our best to build a reliable app and take
        reasonable care of your data, but using CookBlueprint means placing a
        reasonable amount of trust in us, the same as with any other app.
      </p>

      <h2>Contact us</h2>
      <p>
        Questions about these Terms? Email{" "}
        <a href="mailto:privacy@cookblueprint.com">
          privacy@cookblueprint.com
        </a>{" "}
        <em>
          (placeholder — replace with a real inbox you actually monitor
          before publishing this policy).
        </em>
      </p>
    </div>
  );
}
