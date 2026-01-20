export default function DeleteAccountPage() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1>Delete Account – Tontine Pour Tous</h1>

      <p>
        Users of the <strong>Tontine Pour Tous</strong> application can request
        the deletion of their account and associated personal data.
      </p>

      <h2>How to request account deletion</h2>
      <p>
        To request deletion of your account, please send an email to:
      </p>

      <p>
        <strong>Email:</strong> wnguetsop@gmail.com
      </p>

      <p>
        Please include the email address used to create your account.
      </p>

      <h2>Data that will be deleted</h2>
      <ul>
        <li>User account (email and authentication data)</li>
        <li>Tontine data created by the user (members, contributions, records)</li>
      </ul>

      <h2>Data retention</h2>
      <p>
        Some data may be retained for up to 30 days for legal, security, or backup
        purposes, after which it will be permanently deleted.
      </p>
    </main>
  );
}
