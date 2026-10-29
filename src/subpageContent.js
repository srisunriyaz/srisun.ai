// Content for every redesigned sub-page, keyed by route path.
// Each entry picks a template (service, industry, product, partner, resource,
// about, story, brand, policy, directory, stories) and a two-colour theme.
import {
  Target, Workflow, Bell, FileText, PieChart, Users, Phone, Mail, Check, Scale, ShieldCheck, ClipboardList,
  FileSignature, Megaphone, TrendingUp, Search, Palette, Send, Contact, Database, Tags, MessageCircle, ListChecks,
  CreditCard, Smartphone, BarChart3, CalendarCheck, Clock, Globe, Server, Lock, HardDrive, KeyRound, GraduationCap,
  Landmark, Store, Factory, Briefcase, Building2, Monitor, Bot, Cloud, Stethoscope,
  Boxes, Sparkles, BookOpen, Share2, Wallet, Handshake, Plug, Link2, Gift, Network, Newspaper,
  PenLine, LifeBuoy, Compass, Lightbulb, Rocket, Award, Heart, Sun, Eye, Cookie, Copyright, Ban,
  Fingerprint, RefreshCcw, Flag, Receipt, Calendar, MapPin
} from 'lucide-react';

const serviceSteps = (a, b, c, d) => [a, b, c, d];

export const subpages = {
  /* ───────────────────────── SERVICES ───────────────────────── */
  '/services/sales': {
    template: 'service', theme: ['#e2482f', '#f59e0b'], icon: Target, label: 'Sales',
    title: 'A sales process your team will actually use',
    intro: 'We set up the pipeline, follow-ups and reports your sales team needs, so every enquiry gets a reply and nothing slips through.',
    mock: { title: 'Sales pipeline', rows: [[Users, 'New enquiry from website form', 'New'], [Phone, 'Follow-up call booked', 'Today'], [Mail, 'Quote sent to customer', 'Sent'], [Check, 'Deal marked as won', 'Won']], meter: ['Follow-ups completed', 72] },
    featuresTitle: 'What we put in place',
    features: [[Target, 'Lead capture', 'Enquiries from your website, ads and WhatsApp collected in one list.'], [Workflow, 'Sales pipeline', 'Each deal shown by stage, with its owner and next step.'], [Bell, 'Follow-up reminders', 'Automatic reminders, so no enquiry waits too long for a reply.'], [FileText, 'Quotes & proposals', 'Quotes prepared and sent from ready-made templates.'], [PieChart, 'Sales reports', 'Enquiries, conversions and revenue, broken down by person and source.'], [Users, 'Team training', 'Practical training, so the process becomes part of the daily routine.']],
    steps: serviceSteps(['Review', 'We look at how enquiries reach you today and where they get stuck.'], ['Design', 'Together we agree the pipeline stages, owners and follow-up rules.'], ['Set up', 'We configure the tools and connect each lead source.'], ['Train', 'We train your team, then review the numbers with you.']),
    fit: ['Education', 'Retail', 'Professional Services', 'SMEs'],
    faq: [['Do we need new software?', 'Not always. We first check whether your current tools can do the job, and only suggest new ones where there is a real gap.'], ['Can website and WhatsApp leads go to one place?', 'Yes. Web forms, ads and WhatsApp can all feed into a single list.'], ['Can you train our sales team?', 'Yes. Training on the new process and tools is included in the setup.']],
    cta: ['Let’s organise your sales process.', 'Tell us how enquiries reach you today, and we will suggest a setup that suits your team.']
  },
  '/services/legal': {
    template: 'service', theme: ['#3f4a8a', '#8b6fd6'], icon: Scale, label: 'Legal',
    title: 'Sort out the paperwork that comes with going digital',
    intro: 'We help you prepare the policies, agreements and checklists your website and business systems need, so you know what is in place and what is still missing.',
    mock: { title: 'Compliance checklist', rows: [[FileText, 'Privacy policy drafted', 'Done'], [FileSignature, 'Terms of service reviewed', 'Review'], [ShieldCheck, 'Cookie consent added', 'Done'], [ClipboardList, 'Vendor agreements listed', 'Next']], meter: ['Checklist progress', 64] },
    featuresTitle: 'Where we can help',
    features: [[FileText, 'Website policies', 'A privacy policy, terms of service and cookie notice for your site.'], [FileSignature, 'Agreement templates', 'Starting drafts for the client and vendor agreements you use most.'], [ShieldCheck, 'Data protection checks', 'A review of how you collect, store and share personal data.'], [ClipboardList, 'Compliance checklists', 'A clear list of what needs to be in place and who is responsible.'], [Scale, 'Policy updates', 'Documents kept current as your services change.'], [Users, 'Team awareness', 'Plain explanations, so staff know what each policy means for their work.']],
    steps: serviceSteps(['Review', 'We list the documents and processes you already have.'], ['Identify gaps', 'We point out what is missing or out of date.'], ['Prepare', 'We draft the documents and checklists for your review.'], ['Maintain', 'We help you keep everything up to date.']),
    fit: ['Education', 'Healthcare', 'Finance', 'SMEs'],
    faq: [['Does this replace a lawyer?', 'No. For advice on your specific situation, please speak to a qualified lawyer. Our role is to help you prepare and organise the documents.'], ['Which documents does a website need?', 'Most websites need a privacy policy and terms of service, plus a cookie notice if they use tracking. We review your site to confirm what applies.'], ['Can you add these to our website?', 'Yes. Once approved, we publish the documents and add consent banners where they are needed.']],
    cta: ['Let’s check what your business needs.', 'Tell us about your website and services, and we will list the documents to prepare first.']
  },
  '/services/marketing': {
    template: 'service', theme: ['#d62f6d', '#ff8a4c'], icon: Megaphone, label: 'Marketing',
    title: 'Marketing that brings in real enquiries',
    intro: 'We plan and run campaigns across ads, social media, email and WhatsApp, and report what each one brings in, so you can see where your budget is working.',
    mock: { title: 'Campaign tracker', rows: [[Megaphone, 'Admission campaign live', 'Live'], [Search, 'Google search ads', 'Live'], [Send, 'WhatsApp offer sent', 'Sent'], [PieChart, 'Weekly report ready', 'Ready']], meter: ['Monthly budget used', 58] },
    featuresTitle: 'What we handle for you',
    features: [[Target, 'Campaign planning', 'Goals, audience and channels agreed before any money is spent.'], [TrendingUp, 'Paid ads', 'Google and Meta campaigns measured by the enquiries they bring.'], [Palette, 'Creatives', 'Ad designs, posters and short videos.'], [Send, 'Email & WhatsApp', 'Campaigns sent only to people who have agreed to hear from you.'], [Search, 'SEO basics', 'The groundwork that helps people find you on Google.'], [PieChart, 'Reporting', 'Simple reports on spend, reach and enquiries.']],
    steps: serviceSteps(['Plan', 'We agree the goal, audience and budget with you.'], ['Create', 'We prepare the ads, posts and landing pages.'], ['Run', 'We launch the campaign and check results every day.'], ['Report', 'We share the results and move budget towards what works.']),
    fit: ['Education', 'Retail', 'Healthcare', 'SMEs'],
    faq: [['What is the minimum budget?', 'It depends on your goals and the channels you choose. We suggest a starting budget and adjust it once results come in.'], ['Do you create the ad designs?', 'Yes. Our team prepares the creatives and sends them to you for approval.'], ['How often will we get reports?', 'We agree a schedule with you. During a campaign, this is usually weekly.']],
    cta: ['Let’s plan your next campaign.', 'Tell us who you want to reach, and we will suggest channels and a starting budget.']
  },
  '/services/crm': {
    template: 'service', theme: ['#0b7a75', '#36c2a6'], icon: Contact, label: 'CRM',
    title: 'All your customer information in one place',
    intro: 'We set up and customise CRM systems so your team can see who each customer is, what was last discussed and what needs to happen next.',
    mock: { title: 'Customer record', rows: [[Contact, 'Contact details updated', 'Saved'], [MessageCircle, 'WhatsApp chat logged', 'Synced'], [Tags, 'Tagged as repeat customer', 'Tagged'], [Bell, 'Renewal reminder set', 'Due']], meter: ['Profile completeness', 86] },
    featuresTitle: 'What your CRM will do',
    features: [[Database, 'Customer records', 'Contact details, history and notes kept in one profile.'], [Workflow, 'Pipelines', 'Deals, admissions or cases tracked through clear stages.'], [Tags, 'Segments', 'Customers grouped by interest, location or value.'], [Bell, 'Reminders & tasks', 'Follow-ups assigned automatically to the right person.'], [MessageCircle, 'Messaging links', 'Calls, emails and WhatsApp chats logged without extra typing.'], [BarChart3, 'Dashboards', 'Activity and results for each team at a glance.']],
    steps: serviceSteps(['Discover', 'We learn how your team works with customers today.'], ['Configure', 'We set up the fields, stages and permissions.'], ['Migrate', 'We move your existing contacts and history into the new system.'], ['Adopt', 'We train your users and fine-tune the setup.']),
    fit: ['Education', 'Finance', 'Professional Services', 'Retail'],
    faq: [['Which CRM do you work with?', 'Once we understand your needs and budget, we recommend a platform, or customise the one you already use.'], ['Can you move our existing data?', 'Yes. We clean up and import your contacts and history from spreadsheets or your old system.'], ['Can the CRM connect to WhatsApp?', 'Yes, if the platform supports it. We confirm the options during setup.']],
    cta: ['Let’s bring your customer data together.', 'Tell us where your customer information is kept today, and we will suggest a CRM setup.']
  },
  '/services/forms': {
    template: 'service', theme: ['#2563eb', '#22b8cf'], icon: ListChecks, label: 'Forms',
    title: 'Online forms that get the right details the first time',
    intro: 'We build admission, registration, feedback and payment forms that are easy to fill in on any phone and send each response where it needs to go.',
    mock: { title: 'Admission form', rows: [[Users, 'Student details', 'Done'], [FileText, 'Documents uploaded', 'Done'], [CreditCard, 'Application fee paid', 'Paid'], [Mail, 'Confirmation email sent', 'Sent']], meter: ['Form completion', 90] },
    featuresTitle: 'Forms for everyday needs',
    features: [[GraduationCap, 'Admission forms', 'Step-by-step applications with document uploads.'], [ListChecks, 'Registrations', 'Sign-ups for events, courses and memberships.'], [MessageCircle, 'Feedback & surveys', 'Opinions and ratings from customers or parents.'], [CreditCard, 'Payment forms', 'Fees and orders paid by UPI or card.'], [Workflow, 'Automatic routing', 'Each response sent to the right person or system.'], [Smartphone, 'Mobile friendly', 'Quick to complete on any phone.']],
    steps: serviceSteps(['List fields', 'We agree exactly what each form needs to collect.'], ['Design', 'We build a clear form that takes people through one step at a time.'], ['Connect', 'We send responses to email, a spreadsheet or your CRM.'], ['Launch', 'We test the form, publish it and share the link.']),
    fit: ['Education', 'Healthcare', 'Professional Services', 'SMEs'],
    faq: [['Can people upload documents?', 'Yes. Forms can accept photos and PDFs, with limits on file size and type.'], ['Where do responses go?', 'To email, a spreadsheet, your CRM or a database, whichever suits you.'], ['Can forms take payments?', 'Yes. We can connect a payment gateway for fees and orders.']],
    cta: ['Let’s build your next form.', 'Tell us what you need to collect, and we will suggest the right setup.']
  },
  '/services/booking': {
    template: 'service', theme: ['#7c3aed', '#ec4899'], icon: CalendarCheck, label: 'Booking',
    title: 'Let customers book an appointment without calling',
    intro: 'We set up online booking for appointments, classes and services, with reminders and payments included, so your phone is free for other work.',
    mock: { title: 'Today’s bookings', rows: [[Clock, '10:00 Consultation', 'Booked'], [Clock, '11:30 Demo class', 'Booked'], [Bell, 'Reminder sent for 2:00', 'Sent'], [CreditCard, 'Advance payment received', 'Paid']], meter: ['Slots filled today', 68] },
    featuresTitle: 'What online booking covers',
    features: [[CalendarCheck, 'Online calendar', 'Customers choose from the time slots you open.'], [Bell, 'Reminders', 'SMS, email or WhatsApp reminders before each visit.'], [CreditCard, 'Advance payments', 'A deposit or the full amount collected at the time of booking.'], [Users, 'Staff schedules', 'A separate calendar for each person or room.'], [RefreshCcw, 'Easy rescheduling', 'Customers can change or cancel within the rules you set.'], [BarChart3, 'Booking reports', 'Busy hours, no-shows and revenue in one view.']],
    steps: serviceSteps(['Plan', 'We list your services, their durations and the staff involved.'], ['Set up', 'We configure the calendar, booking rules and reminders.'], ['Connect', 'We add booking to your website and WhatsApp.'], ['Launch', 'We test the full booking journey, then go live.']),
    fit: ['Healthcare', 'Education', 'Professional Services', 'Retail'],
    faq: [['Can customers book from our website?', 'Yes. We add a booking page or widget to your site.'], ['Can we take payment when someone books?', 'Yes. A deposit or the full payment can be collected through a payment gateway.'], ['Do customers get reminders?', 'Yes. Reminders can be sent by SMS, email or WhatsApp.']],
    cta: ['Let’s open your calendar online.', 'Tell us what customers book with you, and we will suggest a booking setup.']
  },
  '/services/domain-server': {
    template: 'service', theme: ['#0f766e', '#0ea5e9'], icon: Server, label: 'Domain / Server',
    title: 'Domains, hosting and email you don’t have to worry about',
    intro: 'We register domains, set up hosting and business email, and keep your servers secure and backed up, so your website and inbox keep working.',
    mock: { title: 'Server status', rows: [[Globe, 'yourschool.in renewed', 'Active'], [Lock, 'SSL certificate valid', 'Secure'], [HardDrive, 'Nightly backup complete', 'Done'], [Mail, 'Business email working', 'Online']], meter: ['Disk space used', 41] },
    featuresTitle: 'What we look after',
    features: [[Globe, 'Domain registration', 'The right domain found, registered and renewed on time.'], [Server, 'Web hosting', 'Hosting sized for your website and its traffic.'], [Mail, 'Business email', 'Professional email addresses on your own domain.'], [Lock, 'SSL certificates', 'Secure HTTPS on every site.'], [HardDrive, 'Backups', 'Regular backups that can be restored when needed.'], [KeyRound, 'Access control', 'Safe, shared access for your team and vendors.']],
    steps: serviceSteps(['Audit', 'We check your current domains, hosting and email.'], ['Plan', 'We recommend the right setup and any moves needed.'], ['Migrate', 'We move websites and email with as little downtime as possible.'], ['Maintain', 'We take care of renewals, updates and backups.']),
    fit: ['Education', 'SMEs', 'Professional Services', 'Retail'],
    faq: [['Can you move our existing website?', 'Yes. We plan the move to keep downtime short, then check everything once it is done.'], ['Will you handle renewals?', 'Yes. We track renewal dates for domains and certificates so nothing expires by accident.'], ['Can we get email on our own domain?', 'Yes. We set up business email addresses and connect them to your phones and computers.']],
    cta: ['Let’s keep your site online.', 'Tell us about your current domains and hosting, and we will suggest a setup.']
  },

  /* ───────────────────────── INDUSTRIES ───────────────────────── */
  '/industries/education': {
    template: 'industry', theme: ['#1d4ed8', '#f59e0b'], icon: GraduationCap, label: 'Education',
    title: 'Less paperwork for schools and colleges',
    intro: 'We work with schools, colleges and training institutes on admissions, parent communication, websites and daily administration.',
    challenges: [['Admissions on paper', 'Every season, forms, documents and fees are handled by hand.'], ['Scattered communication', 'Updates for parents and students are spread across calls, notes and groups.'], ['Outdated websites', 'The site is hard to update and awkward to use on a phone.'], ['Manual reports', 'Attendance, fees and results are compiled in spreadsheets.']],
    solutions: [[ListChecks, 'Online admissions', 'Application forms with document uploads and fee payment.', '/services/forms'], [MessageCircle, 'Parent communication', 'WhatsApp and SMS updates on fees, events and results.', '/solutions/business-communication'], [Monitor, 'School websites', 'Fast, mobile-friendly websites your staff can update themselves.', '/solutions/web-and-e-commerce'], [Boxes, 'Campus management', 'Fees, attendance and student records in one system.', '/solutions/software-and-apps']],
    starters: ['Move admissions online before the next season', 'Send fee reminders on WhatsApp', 'Give the school website a refresh'],
    showClients: true, clientsTitle: 'Schools and colleges that work with Srisun',
    faq: [['Do you work with schools as well as colleges?', 'Yes. We work with schools, colleges and training institutes.'], ['Can parents pay fees online?', 'Yes. We can add online fee payment by UPI and card.'], ['Can our staff update the website?', 'Yes. We build on platforms your team can edit, and we train them to do it.']]
  },
  '/industries/finance': {
    template: 'industry', theme: ['#0f5132', '#c9a227'], icon: Landmark, label: 'Finance',
    title: 'Secure, well-organised systems for financial services',
    intro: 'We build software, automation and security for lenders, cooperatives and other financial service firms.',
    challenges: [['Slow loan processing', 'Applications and documents are passed by hand from team to team.'], ['Security pressure', 'Customer data and transactions have to stay protected at all times.'], ['Follow-up gaps', 'Repayment and renewal reminders are easy to miss.'], ['Limited visibility', 'Reports are pieced together from several systems.']],
    solutions: [[Workflow, 'Application workflows', 'Digital applications, document checks and approvals.', '/solutions/software-and-apps'], [ShieldCheck, 'Security reviews', 'Gaps in systems and access found and fixed.', '/solutions/cybersecurity'], [Bell, 'Automated reminders', 'Repayment and renewal reminders sent by SMS and WhatsApp.', '/solutions/business-communication'], [BarChart3, 'Dashboards', 'Portfolio and collection reports in a single view.', '/solutions/ai-and-automation']],
    starters: ['Move the loan application form online', 'Automate repayment reminders', 'Run a security review'],
    faq: [['Can you work with our existing core system?', 'Yes, if it offers an API or data export. We confirm the options during discovery.'], ['How do you handle customer data?', 'We plan access, storage and logging with you, and connect only the data each feature needs.'], ['Can reminders go out automatically?', 'Yes. Reminders can be triggered by the due dates in your system.']]
  },
  '/industries/retail': {
    template: 'industry', theme: ['#c2410c', '#facc15'], icon: Store, label: 'Retail',
    title: 'Sell in your shop, online and on WhatsApp',
    intro: 'We help shops and retail brands run online stores, keep track of stock and bring customers back for repeat purchases.',
    challenges: [['Online and offline in silos', 'Stock and orders are tracked separately for each channel.'], ['Customers who buy once', 'There is no easy way to reach past buyers with offers.'], ['Manual stock counts', 'Items run out unexpectedly, or too much is ordered.'], ['Slow checkout', 'The payment options don’t match how customers want to pay.']],
    solutions: [[Store, 'Online stores', 'Shopify, WooCommerce or custom stores linked to your stock.', '/solutions/web-and-e-commerce'], [Boxes, 'Inventory & billing', 'One view of stock across your shop and website.', '/services/erp'], [Send, 'WhatsApp marketing', 'Offers and updates for customers who have opted in.', '/solutions/business-communication'], [Megaphone, 'Local ads', 'Campaigns that bring nearby shoppers through your door.', '/services/marketing']],
    starters: ['Launch a simple online store', 'Connect stock across your channels', 'Start a WhatsApp customer list'],
    faq: [['Can the online store share stock with our shop?', 'Yes. We can connect the store to your billing or inventory system.'], ['Do you support UPI payments?', 'Yes. We set up payment gateways that accept UPI, cards and wallets.'], ['Can you run our ads?', 'Yes. We run Google and Meta campaigns and report the results to you.']]
  },
  '/industries/manufacturing': {
    template: 'industry', theme: ['#334155', '#f97316'], icon: Factory, label: 'Manufacturing',
    title: 'One connected system, from purchase to dispatch',
    intro: 'We help manufacturers connect production, stock, quality and orders, so every team works from the same information.',
    challenges: [['Spreadsheet planning', 'Production plans and stock are kept in separate files.'], ['Little shop-floor visibility', 'Managers have to phone around for updates.'], ['Paper quality checks', 'Inspection records are hard to find when you need them.'], ['Disconnected orders', 'Sales, purchase and dispatch don’t stay in step.']],
    solutions: [[Boxes, 'ERP for production', 'Planning, stock, purchase and dispatch in one system.', '/services/erp'], [Smartphone, 'Shop-floor apps', 'Simple mobile apps for updates and checklists.', '/solutions/software-and-apps'], [BarChart3, 'Production dashboards', 'Output, delays and stock levels at a glance.', '/solutions/ai-and-automation'], [ShieldCheck, 'Plant IT security', 'Protection for your systems, devices and logins.', '/solutions/cybersecurity']],
    starters: ['Map your order-to-dispatch process', 'Move quality checklists online', 'Set up a stock dashboard'],
    faq: [['Can you work with our existing machines and software?', 'We review what data your systems can share and plan integrations wherever possible.'], ['Do we need a full ERP?', 'Not always. We start with the process that causes the most delays and build from there.'], ['Can supervisors use phones on the floor?', 'Yes. We build simple mobile screens for updates and checklists.']]
  },
  '/industries/healthcare': {
    template: 'industry', theme: ['#0e7490', '#10b981'], icon: Stethoscope, label: 'Healthcare',
    title: 'Less paperwork and smoother patient visits',
    intro: 'We help clinics, hospitals and diagnostic centres with appointments, patient communication, websites and data security.',
    challenges: [['Phone-only bookings', 'The front desk spends the day answering booking calls.'], ['Missed appointments', 'Patients get no reminder before their visit.'], ['Sensitive records', 'Patient data has to stay private and secure.'], ['Hard-to-find information', 'The website doesn’t answer the questions patients ask most.']],
    solutions: [[CalendarCheck, 'Online appointments', 'Patients book a slot by doctor and service.', '/services/booking'], [Bell, 'Visit reminders', 'SMS and WhatsApp reminders before each visit.', '/solutions/business-communication'], [Lock, 'Data protection', 'Access control, backups and security reviews.', '/solutions/cybersecurity'], [Monitor, 'Clinic websites', 'Doctors, services, timings and directions, easy to read on a phone.', '/solutions/web-and-e-commerce']],
    starters: ['Add online booking to your website', 'Send automatic visit reminders', 'Review who can access patient data'],
    faq: [['Can patients book with a specific doctor?', 'Yes. Each doctor can have their own calendar and time slots.'], ['How is patient data protected?', 'We set up access control, backups and security checks, and agree how data is handled with you.'], ['Can reports be shared with patients online?', 'We can talk through secure sharing options that work with your current systems.']]
  },
  '/industries/professional-services': {
    template: 'industry', theme: ['#4338ca', '#06b6d4'], icon: Briefcase, label: 'Professional Services',
    title: 'Spend less time on admin and more on clients',
    intro: 'We help consultants, agencies, CA firms and law practices keep clients, documents and billing in one place.',
    challenges: [['Client details everywhere', 'Notes, emails and files are scattered across different inboxes.'], ['Manual billing', 'Invoices and payment follow-ups are done by hand.'], ['Slow onboarding', 'New clients fill in the same forms again and again.'], ['Hard to track time', 'It is difficult to see where the hours go.']],
    solutions: [[Contact, 'Client CRM', 'Every client, contact and conversation in one record.', '/services/crm'], [ListChecks, 'Onboarding forms', 'Documents and details collected online.', '/services/forms'], [Receipt, 'Billing workflows', 'Invoices, reminders and payment links.', '/solutions/software-and-apps'], [CalendarCheck, 'Meeting booking', 'Clients book consultations online.', '/services/booking']],
    starters: ['Set up a simple client CRM', 'Move client onboarding online', 'Automate invoice reminders'],
    faq: [['Can documents be collected securely?', 'Yes. We set up forms and storage that only your team can access.'], ['Can you connect billing to our accounting software?', 'Yes, if the software offers an API or data import.'], ['Is this suitable for small firms?', 'Yes. We size the setup to your team and expand it as you grow.']]
  },
  '/industries/smes': {
    template: 'industry', theme: ['#b45309', '#16a34a'], icon: Building2, label: 'SMEs',
    title: 'Dependable technology for growing businesses',
    intro: 'We help small and medium businesses get online, organise their operations and protect what they have built, one step at a time.',
    challenges: [['No time for IT', 'Owners deal with technology on top of everything else.'], ['Too many tools', 'Separate apps that don’t share information.'], ['Weak online presence', 'Customers struggle to find the business online, or to trust what they find.'], ['Security as an afterthought', 'Shared passwords and no backups.']],
    solutions: [[Monitor, 'Website & store', 'A professional website or online store.', '/solutions/web-and-e-commerce'], [Boxes, 'Simple ERP', 'Billing, stock and accounts in one place.', '/services/erp'], [Megaphone, 'Local marketing', 'Ads and social posts that bring in enquiries.', '/solutions/digital-growth'], [ShieldCheck, 'Basic security', 'Backups, access control and staff awareness.', '/solutions/cybersecurity']],
    starters: ['Launch or refresh your website', 'Bring billing and stock into one system', 'Set up backups and secure logins'],
    faq: [['We have a small budget. Where should we start?', 'Start with the problem that costs you the most time or sales. We will suggest a sensible first step.'], ['Can you be our IT team?', 'Yes. We can provide ongoing support for your website, systems and security.'], ['Do we need to change everything at once?', 'No. We plan the changes in small, manageable steps.']]
  },

  /* ───────────────────────── PRODUCTS ───────────────────────── */
  '/products/srisun-ai': {
    template: 'product', theme: ['#5b21b6', '#06b6d4'], mark: 'AI', tagline: 'AI agents and automation, built around your data and your rules.',
    intro: 'Talk to us about where AI and automation could help your organisation: the tasks worth automating, the data involved and the controls you need.',
    prepare: [[ListChecks, 'Repetitive tasks', 'The jobs that take up most of your team’s week.'], [Database, 'Where your data lives', 'The spreadsheets, software and documents the AI may need to use.'], [ShieldCheck, 'Your limits', 'Anything the AI must never do without a person approving it.']]
  },
  '/products/srisun-books': {
    template: 'product', theme: ['#047857', '#84cc16'], mark: 'Books', tagline: 'See whether Srisun Books suits the way you work.',
    intro: 'Ask for a walkthrough of Srisun Books, and our team will confirm the current features and availability.',
    prepare: [[FileText, 'Your current process', 'How you keep records today and the tools you use.'], [Users, 'Who will use it', 'The people and roles who will need access.'], [Calendar, 'Your timeline', 'When you would like to get started.']]
  },
  '/products/srisun-social': {
    template: 'product', theme: ['#db2777', '#f97316'], mark: 'Social', tagline: 'Communication tools for customers, members and students.',
    intro: 'Tell us how your organisation communicates today, and our team will show you how Srisun Social works.',
    prepare: [[MessageCircle, 'Your channels', 'Where you talk to customers, members or students today.'], [Users, 'Your audience', 'Who you want to reach, and how often.'], [Target, 'Your goals', 'What you want better communication to change.']]
  },
  '/products/zedu': {
    template: 'product', theme: ['#2563eb', '#facc15'], mark: 'Zedu', tagline: 'Education and learning, organised in one place.',
    intro: 'Share what your institution needs, and our team will take you through Zedu.',
    prepare: [[GraduationCap, 'Your institution', 'School, college, coaching centre or training team.'], [Users, 'Your learners', 'Who your learners are, how many there are and how they study today.'], [ListChecks, 'Your must-haves', 'The features you need from the first day.']]
  },
  '/products/xloan': {
    template: 'product', theme: ['#0f766e', '#22c55e'], mark: 'XLoan', tagline: 'Lending workflows, from first enquiry to final decision.',
    intro: 'Ask for a walkthrough of XLoan, and our team will confirm the current features and availability.',
    prepare: [[Briefcase, 'Your organisation', 'The kind of lending or financial service you offer.'], [Workflow, 'Your current process', 'How an application moves from enquiry to decision today.'], [Calendar, 'Your timeline', 'When you would like to get started.']]
  },

  /* ───────────────────────── PARTNERS ───────────────────────── */
  '/partners/partner-program': {
    template: 'partner', theme: ['#e50920', '#f59e0b'], icon: Handshake, label: 'Partner Program',
    title: 'Partner with Srisun',
    intro: 'Our Partner Program is for organisations that want to build, sell or deliver technology alongside us.',
    who: [[Plug, 'Technology providers', 'Platforms and tools that work well with Srisun services.'], [Store, 'Resellers', 'Businesses whose customers need the services we offer.'], [Users, 'Agencies & consultants', 'Teams looking for a reliable delivery partner for client work.']],
    share: ['Your organisation and where you are based', 'The services or products you offer', 'The customers you work with', 'The kind of partnership you have in mind']
  },
  '/partners/technology-partners': {
    template: 'partner', theme: ['#2563eb', '#06b6d4'], icon: Network, label: 'Technology Partners',
    title: 'Bring your technology to our customers',
    intro: 'If your platform, product or tool could help our customers work better, we would like to hear from you.',
    who: [[Cloud, 'Software platforms', 'SaaS, cloud and business tools.'], [Bot, 'AI and data products', 'Tools for automation, analytics and AI.'], [ShieldCheck, 'Security vendors', 'Products that protect data, devices and logins.']],
    share: ['Your product and what it does', 'Who uses it today', 'How it connects with other systems', 'How you see us working together']
  },
  '/partners/reseller-partners': {
    template: 'partner', theme: ['#c2410c', '#eab308'], icon: Store, label: 'Reseller Partners',
    title: 'Offer Srisun services to your customers',
    intro: 'For businesses that would like to add websites, software, AI or security services to what they already sell.',
    who: [[Store, 'IT and hardware sellers', 'Shops and distributors with business customers.'], [Briefcase, 'Service providers', 'Firms whose customers keep asking for digital help.'], [MapPin, 'Regional businesses', 'Organisations with a strong local customer network.']],
    share: ['Your business and the region you cover', 'The customers you sell to', 'The Srisun services you are interested in', 'How you sell today']
  },
  '/partners/integration-partners': {
    template: 'partner', theme: ['#0f766e', '#8b5cf6'], icon: Link2, label: 'Integration Partners',
    title: 'Connect your product to our client projects',
    intro: 'For teams whose APIs and connectors help our customers link their systems together.',
    who: [[Plug, 'API providers', 'Payment, messaging, accounting and other services with an API.'], [Workflow, 'Integration platforms', 'Tools that move data between applications.'], [Database, 'Data services', 'Products that store, clean or analyse data.']],
    share: ['Your product and its API', 'Documentation or sandbox access', 'Typical ways your customers use it', 'A contact person on your team']
  },
  '/partners/strategic-partnerships': {
    template: 'partner', theme: ['#1e3a8a', '#e50920'], icon: Award, label: 'Strategic Partnerships',
    title: 'Long-term work on shared goals',
    intro: 'For institutions and organisations that want to work with us on larger initiatives over several years.',
    who: [[GraduationCap, 'Institutions', 'Colleges, universities and training bodies.'], [Building2, 'Organisations', 'Companies planning technology programmes over several years.'], [Heart, 'Community initiatives', 'Programmes that bring technology to more people.']],
    share: ['Your organisation and its goals', 'The initiative you have in mind', 'The people who will be involved', 'Your expected timeline']
  },
  '/partners/affiliate-program': {
    template: 'partner', theme: ['#db2777', '#8b5cf6'], icon: Gift, label: 'Affiliate Program',
    title: 'Introduce businesses to Srisun',
    intro: 'For people and organisations who know businesses that need our services and are happy to make an introduction.',
    who: [[Users, 'Consultants & advisors', 'People whose clients ask them for technology help.'], [Megaphone, 'Creators & communities', 'Groups with an audience of business owners.'], [Briefcase, 'Freelancers', 'Specialists who work with growing businesses.']],
    share: ['Who you are and what you do', 'The audience or network you reach', 'The kind of customers you could introduce', 'How you would like to work with us']
  },

  /* ───────────────────────── RESOURCES ───────────────────────── */
  '/resources/announcements': {
    template: 'resource', variant: 'timeline', theme: ['#e50920', '#1688ff'], icon: Newspaper, label: 'Announcements Hub',
    title: 'News and updates from Srisun', intro: 'This is where we will publish company news, product updates and announcements.',
    topics: ['Company news', 'Product updates', 'New services', 'Events'],
    panelTitle: 'Want the latest news now?', panelText: 'Get in touch, and we will share our recent updates with you.', panelCta: ['Contact Us for Updates', '/contact-us']
  },
  '/resources/blog': {
    template: 'resource', variant: 'grid', theme: ['#2563eb', '#8b5cf6'], icon: PenLine, label: 'Blog',
    title: 'Practical writing on technology and work', intro: 'Notes from the Srisun team on websites, software, AI, security and running a growing business.',
    topics: ['Websites & stores', 'Software & apps', 'AI & automation', 'Cybersecurity', 'Digital growth'],
    panelTitle: 'Have a question for our team?', panelText: 'Tell us what you would like us to write about, or simply ask us directly.', panelCta: ['Ask Srisun', '/contact-us']
  },
  '/resources/shri-ai-agent': {
    template: 'resource', variant: 'chat', theme: ['#7c3aed', '#06b6d4'], icon: Bot, label: 'Shri (AI Agent)',
    title: 'Meet Shri, our AI agent project', intro: 'Shri is our work on AI agents that answer questions, find information and pass requests to the right person.',
    topics: ['Answering questions', 'Finding information', 'Drafting replies', 'Routing requests'],
    chat: ['Hi, I’m Shri. How can I help?', 'Which service fits a new school website?', 'Let me connect you with the Srisun team for that.'],
    panelTitle: 'Want to know more about Shri?', panelText: 'Ask our team what Shri can do today and what is planned next.', panelCta: ['Ask About Shri', '/contact-us']
  },
  '/resources/newsletter': {
    template: 'resource', variant: 'mail', theme: ['#0f766e', '#f59e0b'], icon: Mail, label: 'Newsletter',
    title: 'Srisun news, straight to your inbox', intro: 'Get in touch to ask about our updates and future newsletter editions.',
    topics: ['Practical technology tips', 'Srisun news', 'New services', 'Client stories'],
    panelTitle: 'Would you like to hear from us?', panelText: 'Send us your email address and ask to be added to future editions.', panelCta: ['Ask to Subscribe', '/contact-us']
  },
  '/resources/the-long-game': {
    template: 'resource', variant: 'quote', theme: ['#1e293b', '#e2a900'], icon: Compass, label: 'The Long Game',
    title: 'Technology built to last', intro: 'Thoughts on building useful technology and the skills to keep it working over the years.',
    quote: 'Good technology is not a one-off project. It is something you keep building on.',
    topics: ['Long-term thinking', 'Digital capability', 'Useful technology', 'Learning teams'],
    panelTitle: 'Planning for the long term?', panelText: 'Talk to us about building your capability one step at a time.', panelCta: ['Start a Conversation', '/contact-us']
  },
  '/resources/knowledge-base': {
    template: 'resource', variant: 'search', theme: ['#0369a1', '#22c55e'], icon: BookOpen, label: 'Knowledge Base',
    title: 'Help with your Srisun product or service', intro: 'For support with any Srisun product or service, contact our team. Choose a topic below to get started.',
    topics: ['Websites & hosting', 'Apps & software', 'ERP & CRM', 'Email & domains', 'Security', 'Billing'],
    panelTitle: 'Need help right away?', panelText: 'Tell our team which product or service you need help with.', panelCta: ['Contact Support', '/contact-us']
  },
  '/resources/concierge': {
    template: 'resource', variant: 'route', theme: ['#e50920', '#7c3aed'], icon: LifeBuoy, label: 'Concierge',
    title: 'Tell us what you need, and we will point you the right way.',
    intro: 'Not sure where to begin? Pick the option closest to what you need, or contact us and we will pass your enquiry to the right person.',
    routes: [['I need a website or online store', '/solutions/web-and-e-commerce'], ['I want to automate repetitive work', '/solutions/ai-and-automation'], ['I need custom software or an app', '/solutions/software-and-apps'], ['I am worried about security', '/solutions/cybersecurity'], ['I want more enquiries', '/solutions/digital-growth'], ['I need expert advice first', '/solutions/tech-consulting']],
    panelTitle: 'Still not sure?', panelText: 'Describe what you need, and we will pass your enquiry to the right person.', panelCta: ['Talk to Concierge', '/contact-us']
  },

  /* ───────────────────────── COMPANY ───────────────────────── */
  '/company/about-srisun': { template: 'about', theme: ['#e50920', '#1688ff'] },
  '/company/our-story': { template: 'story', theme: ['#1688ff', '#e2a900'] },
  '/company/brand-guidelines': { template: 'brand', theme: ['#e50920', '#079b68'] },

  /* ───────────────────────── DIRECTORIES ───────────────────────── */
  '/services': {
    template: 'directory', theme: ['#e50920', '#f59e0b'], eyebrow: 'SERVICES', title: 'Services to plan, build and run your business',
    intro: 'Choose a service to see what it includes, how it works and how to get started.',
    items: [[Target, 'Sales', 'Pipelines, follow-ups and sales reports.', '/services/sales'], [Boxes, 'ERP', 'Finance, stock and operations in one system.', '/services/erp'], [Scale, 'Legal', 'Policies, agreements and compliance checklists.', '/services/legal'], [Megaphone, 'Marketing', 'Campaigns across ads, social media and WhatsApp.', '/services/marketing'], [Contact, 'CRM', 'Customer records and follow-ups in one place.', '/services/crm'], [ListChecks, 'Forms', 'Admission, registration and payment forms.', '/services/forms'], [CalendarCheck, 'Booking', 'Online appointments with automatic reminders.', '/services/booking'], [Server, 'Domain / Server', 'Domains, hosting, business email and backups.', '/services/domain-server']]
  },
  '/solutions': {
    template: 'directory', theme: ['#1237b5', '#0d6b6e'], eyebrow: 'SOLUTIONS', title: 'Solutions for each stage of your growth',
    intro: 'From early advice to secure, automated day-to-day operations. Choose where you would like to start.',
    items: [[Compass, 'Tech Consulting', 'Clear technology decisions and practical roadmaps.', '/solutions/tech-consulting'], [Store, 'Web & E-Commerce', 'Websites and online stores built to sell.', '/solutions/web-and-e-commerce'], [Smartphone, 'Software & Apps', 'Web apps, mobile apps and business software.', '/solutions/software-and-apps'], [Bot, 'AI & Automation', 'AI agents, automated workflows and analytics.', '/solutions/ai-and-automation'], [ShieldCheck, 'Cybersecurity', 'Security reviews, protection and staff training.', '/solutions/cybersecurity'], [MessageCircle, 'Business Communication', 'WhatsApp, SMS and customer messaging.', '/solutions/business-communication'], [TrendingUp, 'Digital Growth', 'Branding, ads, SEO and content.', '/solutions/digital-growth']]
  },
  '/industries': {
    template: 'directory', theme: ['#1d4ed8', '#10b981'], eyebrow: 'INDUSTRIES', title: 'Technology suited to your sector',
    intro: 'Every sector has its own challenges. See how we help organisations like yours.',
    items: [[GraduationCap, 'Education', 'Admissions, communication and campus systems.', '/industries/education'], [Landmark, 'Finance', 'Secure workflows and automatic reminders.', '/industries/finance'], [Store, 'Retail', 'Online stores, stock control and customer marketing.', '/industries/retail'], [Factory, 'Manufacturing', 'Production, stock and dispatch, all connected.', '/industries/manufacturing'], [Stethoscope, 'Healthcare', 'Appointments, reminders and data security.', '/industries/healthcare'], [Briefcase, 'Professional Services', 'Client records, onboarding and billing.', '/industries/professional-services'], [Building2, 'SMEs', 'Sensible first steps for growing businesses.', '/industries/smes']]
  },
  '/partners': {
    template: 'directory', theme: ['#e50920', '#8b5cf6'], eyebrow: 'PARTNERS', title: 'Work with Srisun as a partner',
    intro: 'Choose the type of partnership that best matches what your organisation offers.',
    items: [[Handshake, 'Partner Program', 'An overview of how we work with partners.', '/partners/partner-program'], [Network, 'Technology Partners', 'Platforms and tools that complement our work.', '/partners/technology-partners'], [Store, 'Reseller Partners', 'Offer Srisun services to your own customers.', '/partners/reseller-partners'], [Link2, 'Integration Partners', 'APIs and connectors for client projects.', '/partners/integration-partners'], [Award, 'Strategic Partnerships', 'Long-term work on larger goals.', '/partners/strategic-partnerships'], [Gift, 'Affiliate Program', 'Introduce new customers to Srisun.', '/partners/affiliate-program']]
  },
  '/products': {
    template: 'directory', theme: ['#5b21b6', '#e50920'], eyebrow: 'PRODUCTS', title: 'Srisun products and platforms',
    intro: 'Software products from Srisun. Talk to our team to find out which one suits your organisation.',
    items: [[Sparkles, 'Srisun AI', 'AI agents and automation.', '/products/srisun-ai'], [BookOpen, 'Srisun Books', 'Walkthrough available on request.', '/products/srisun-books'], [Share2, 'Srisun Social', 'Communication with customers, members and students.', '/products/srisun-social'], [GraduationCap, 'Zedu', 'Education and learning in one place.', '/products/zedu'], [Wallet, 'XLoan', 'Lending workflows, from enquiry to decision.', '/products/xloan']]
  },
  '/clients': {
    template: 'directory', theme: ['#079b68', '#1688ff'], eyebrow: 'CLIENTS', title: 'The organisations we work with',
    intro: 'Schools, colleges and businesses across India. Browse their logos, our training programme and other ways to work with us.',
    items: [[Users, 'Customer Stories', 'The schools, colleges and businesses we work with.', '/clients/stories'], [Award, 'Training & Certifications', 'Courses from the Srisun training institute.', 'https://sit.srisun.org/'], [Gift, 'Affiliate Program', 'Introduce new customers to Srisun.', '/partners/affiliate-program']],
    showClients: true
  },
  '/clients/stories': { template: 'stories', theme: ['#079b68', '#e2a900'] }
};

const policyIcons = { Security: ShieldCheck, Compliance: ClipboardList, 'IPR Complaints': Copyright, 'Terms of Service': FileSignature, 'Privacy Policy': Eye, 'Refund Policy': RefreshCcw, 'Trademark Policy': Flag, 'Cookie Policy': Cookie, 'GDPR Compliance': Fingerprint, 'Abuse Policy': Ban };
export const policyList = Object.keys(policyIcons).map((title) => ({ title, icon: policyIcons[title], href: `/legal/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` }));
policyList.forEach(({ title, href }) => { subpages[href] = { template: 'policy', theme: ['#172b4d', '#e50920'], label: title }; });

export const aboutValues = [[Users, 'People first', 'We design for the people who will use the product every day, not only the people who approve it.'], [Lightbulb, 'Always learning', 'Every project teaches us something, and we carry it into the next one.'], [ShieldCheck, 'Honest updates', 'We tell you what we know, what we do not know yet and what happens next.'], [Globe, 'Local roots, wider reach', 'Understanding local needs well helps us build for customers anywhere.']];
export const aboutCapabilities = [[Compass, 'Consult', '/solutions/tech-consulting'], [Monitor, 'Build', '/solutions/software-and-apps'], [Bot, 'Automate', '/solutions/ai-and-automation'], [ShieldCheck, 'Protect', '/solutions/cybersecurity'], [MessageCircle, 'Connect', '/solutions/business-communication'], [TrendingUp, 'Grow', '/solutions/digital-growth']];
export const storyChapters = [[Sun, 'Roots', 'Srisun started in Tiruvannamalai, Tamil Nadu, and that is still where our team works from.'], [Users, 'People', 'Before we build anything, we talk to the people who deal with the problem every day.'], [Rocket, 'Work', 'Our work now covers consulting, websites, software, AI, security and digital marketing.'], [Globe, 'Next', 'We keep learning, and keep building for organisations across India and abroad.']];
export const brandColours = [['Srisun Red', '#e50920', '--red'], ['Brand Blue', '#0182fc', '--brand-blue'], ['Accent Blue', '#1688ff', '--accent-blue'], ['Accent Green', '#079b68', '--accent-green'], ['Accent Yellow', '#e2a900', '--accent-yellow'], ['Navy', '#172b4d', '--navy']];
export const brandRules = [[Check, true, 'Use only the official logo files provided by the Srisun team.'], [Check, true, 'Leave clear space around the logo on all sides.'], [Check, true, 'Use the brand colours exactly as shown above.'], [Ban, false, 'Don’t stretch, recolour or rotate the logo.'], [Ban, false, 'Don’t add effects such as shadows or outlines.'], [Ban, false, 'Don’t use the brand in public campaigns without our approval.']];
