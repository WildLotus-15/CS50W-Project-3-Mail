document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('form').onsubmit = sendEmail

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // Load emails in relation to mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails)
      emails.forEach(email => show_email(email, mailbox))
    })

}

function sendEmail() {
  const recipients = document.querySelector('#compose-recipients').value
  const subject = document.querySelector('#compose-subject').value
  const body = document.querySelector('#compose-body').value

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      console.log(result)
    })
  load_mailbox('sent')
  return false;
}

function show_email(email, mailbox) {
  const emailDiv = document.createElement('div')
  emailDiv.id = "email-div"
  emailDiv.className = "row"

  const recipients = document.createElement('div')
  recipients.id = "compose-recipients"
  recipients.className = "col-md-3"
  if (mailbox === "inbox") {
    recipients.innerHTML = email.sender
  } else {
    recipients.innerHTML = email.recipients[0]
  }
  emailDiv.append(recipients)

  const subject = document.createElement('div')
  subject.id = "compose-subject"
  subject.className = "col-md-6"
  subject.innerHTML = email.subject
  emailDiv.append(subject)

  const timestamp = document.createElement('div')
  timestamp.id = "compose-timestamp"
  timestamp.className = "col-md-4"
  timestamp.innerHTML = email.timestamp
  emailDiv.append(timestamp)

  document.querySelector('#emails-view').append(emailDiv)
}