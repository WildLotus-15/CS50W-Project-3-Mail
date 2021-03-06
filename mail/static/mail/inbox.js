document.addEventListener('DOMContentLoaded', function() {
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
    document.querySelector('#details-view').style.display = 'none';
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
    document.querySelector('#details-view').style.display = 'none';

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
    load_mailbox('sent');
    localStorage.clear()
    return false;
}

function show_email(email, mailbox) {
    // creating wrapper
    const emailDiv = document.createElement('div')
    emailDiv.id = "email-div"
    emailDiv.className = "row"

    // getting recipients
    const recipients = document.createElement('div')
    recipients.id = "email-recipient"
    recipients.className = "col-lg-2 col-md-3 col-sm-12"
    if (mailbox === "inbox") {
        recipients.innerHTML = email.sender // showing sender on inbox page
    } else {
        recipients.innerHTML = email.recipients[0] // showing recipient on other pages
    }
    emailDiv.append(recipients)

    // getting subject
    const subject = document.createElement('div')
    subject.id = "email-subject"
    subject.className = "col-lg-6 col-md-5 col-sm-12"
    subject.innerHTML = email.subject
    emailDiv.append(subject)

    // getting timestamp
    const timestamp = document.createElement('div')
    timestamp.id = "email-timestamp"
    timestamp.className = "col-lg-3 col-md-3 col-sm-12"
    timestamp.innerHTML = email.timestamp
    emailDiv.append(timestamp)

    // adding archive button 
    if (mailbox !== "sent") {
        const button = document.createElement('img')
        button.src = "static/mail/archive.svg"
        button.id = "archive-icon"
        button.innerHTML = "archive"
        emailDiv.append(button)
        button.addEventListener('click', () => email_archive(email.id, email.archived))
    }

    // depending on result changing background color
    const emailCard = document.createElement('div')
    emailCard.id = "email-card"
    if (email.read) {
        emailCard.className = "seen"
    } else {
        emailCard.className = "unseen"
    }
    emailCard.append(emailDiv)

    // appending created filled wrapper to a page 
    document.querySelector('#emails-view').append(emailCard);

    // when clicking on properties view_email function shows
    recipients.addEventListener('click', () => view_email(email.id))
    subject.addEventListener('click', () => view_email(email.id))
    timestamp.addEventListener('click', () => view_email(email.id))
}

function view_email(id) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#details-view').style.display = 'block';

    // getting information
    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            console.log(email)
            read_email(id)
            document.querySelector('#view-email-recipient').innerHTML = email.recipients
            document.querySelector('#view-email-sender').innerHTML = email.sender
            document.querySelector('#view-email-subject').innerHTML = email.subject
            document.querySelector('#view-email-timestamp').innerHTML = email.timestamp
            document.querySelector('#view-email-body').innerHTML = email.body

            // getting reply button and attaching click event handler to it
            document.getElementById('reply-button').addEventListener('click', () => reply_email(email))
        })
}

// changing email read property with put method
function read_email(id) {
    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    })
}

function email_archive(id, initialValue) {
    const newValue = !initialValue
    console.log(`updating email archive = ${newValue}`)
    fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: newValue
        })
    })
    load_mailbox('inbox')
    window.location.reload() // automatically realoading window / F5
}

function reply_email(email) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#details-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    document.querySelector('#compose-recipients').value = email.sender
    // if "Re: "" doesn't exists create it
    if (email.subject.indexOf("Re: ") === -1) {
        email.subject = `Re: ${email.subject}`
    }
    // if "Re: " exists we will not add it again
    document.querySelector('#compose-subject').value = email.subject
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: "${email.body}"`
}