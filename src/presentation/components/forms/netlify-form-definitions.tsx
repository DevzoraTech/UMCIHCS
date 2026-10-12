const fields = ["kind", "name", "email", "phone", "location", "organisation", "profile", "interest", "message", "consent"];

function Definition({ name, subject }: { name: string; subject: string }) {
  return (
    <form name={name} method="POST" data-netlify="true" data-netlify-honeypot="website">
      <input type="hidden" name="form-name" value={name} />
      <input type="hidden" name="subject" data-remove-prefix="" value={subject} />
      {fields.map((field) => <input key={field} name={field} />)}
      <input name="website" />
    </form>
  );
}

export function NetlifyFormDefinitions() {
  return (
    <div hidden aria-hidden="true">
      <Definition name="contact-enquiry" subject="UMCIHCS contact enquiry" />
      <Definition name="membership-application" subject="UMCIHCS membership application" />
    </div>
  );
}
