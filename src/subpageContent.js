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
  Fingerprint, RefreshCcw, Flag, Layers, Receipt, Calendar, MapPin
} from 'lucide-react';

const serviceSteps = (a, b, c, d) => [a, b, c, d];

export const subpages = {
  /* ───────────────────────── SERVICES ───────────────────────── */
  '/services/sales': {
    template: 'service', theme: ['#e2482f', '#f59e0b'], icon: Target, label: 'Sales',
    title: 'A sales process your team can follow every day',
    intro: 'Srisun sets up the pipeline, follow-ups and reports your sales team needs, so no enquiry is forgotten.',
    mock: { title: 'Sales pipeline', rows: [[Users, 'New enquiry from website form', 'New'], [Phone, 'Follow-up call booked', 'Today'], [Mail, 'Quote sent to customer', 'Sent'], [Check, 'Deal marked as won', 'Won']], meter: ['Follow-ups completed', 72] },
    featuresTitle: 'What we set up',
    features: [[Target, 'Lead capture', 'Collect enquiries from your website, ads and WhatsApp in one list.'], [Workflow, 'Sales pipeline', 'See every deal by stage, owner and next step.'], [Bell, 'Follow-up reminders', 'Automatic nudges so no enquiry waits too long.'], [FileText, 'Quotes & proposals', 'Create and send quotes from ready templates.'], [PieChart, 'Sales reports', 'Track enquiries, conversions and revenue by person and source.'], [Users, 'Team training', 'Help your team use the process every day.']],
    steps: serviceSteps(['Review', 'We map how enquiries reach you and where they slow down.'], ['Design', 'We agree pipeline stages, owners and follow-up rules.'], ['Set up', 'We configure the tools and connect your lead sources.'], ['Train', 'We train your team and review the numbers together.']),
    fit: ['Education', 'Retail', 'Professional Services', 'SMEs'],
    faq: [['Do we need new software?', 'Not always. We first check whether your current tools can do the job, and suggest additions only where needed.'], ['Can website and WhatsApp leads go to one place?', 'Yes. We connect web forms, ads and WhatsApp so enquiries land in a single list.'], ['Can you train our sales team?', 'Yes. Training on the new process and tools is part of the setup.']],
    cta: ['Let’s organise your sales process.', 'Tell us how enquiries reach you today. We will suggest a setup that fits your team.']
  },
  '/services/legal': {
    template: 'service', theme: ['#3f4a8a', '#8b6fd6'], icon: Scale, label: 'Legal',
    title: 'Get the legal side of going digital in order',
    intro: 'Srisun helps you prepare the policies, agreements and checklists your website and business systems need.',
    mock: { title: 'Compliance checklist', rows: [[FileText, 'Privacy policy drafted', 'Done'], [FileSignature, 'Terms of service reviewed', 'Review'], [ShieldCheck, 'Cookie consent added', 'Done'], [ClipboardList, 'Vendor agreements listed', 'Next']], meter: ['Checklist progress', 64] },
    featuresTitle: 'Where we help',
    features: [[FileText, 'Website policies', 'Privacy policy, terms of service and cookie notices for your site.'], [FileSignature, 'Agreement templates', 'Starting templates for common client and vendor agreements.'], [ShieldCheck, 'Data protection checks', 'Review how you collect, store and share personal data.'], [ClipboardList, 'Compliance checklists', 'A clear list of what to put in place and who owns it.'], [Scale, 'Policy updates', 'Keep documents current as your services change.'], [Users, 'Team awareness', 'Help staff understand what the policies mean day to day.']],
    steps: serviceSteps(['Review', 'We list the documents and processes you already have.'], ['Identify gaps', 'We note what is missing or out of date.'], ['Prepare', 'We draft documents and checklists for your review.'], ['Maintain', 'We help you keep them up to date.']),
    fit: ['Education', 'Healthcare', 'Finance', 'SMEs'],
    faq: [['Does this replace a lawyer?', 'No. For legal advice specific to your situation, consult a qualified lawyer. We help you prepare and organise the documents.'], ['Which documents does a website need?', 'Most sites need a privacy policy and terms of service, and a cookie notice if they use tracking. We review your site to confirm.'], ['Can you add these to our website?', 'Yes. We can publish the approved documents and add consent banners where needed.']],
    cta: ['Let’s check what your business needs.', 'Tell us about your website and services. We will list the documents to prepare first.']
  },
  '/services/marketing': {
    template: 'service', theme: ['#d62f6d', '#ff8a4c'], icon: Megaphone, label: 'Marketing',
    title: 'Marketing that turns attention into enquiries',
    intro: 'Srisun plans and runs campaigns across ads, social media, email and WhatsApp, with reports that show what each one brings in.',
    mock: { title: 'Campaign tracker', rows: [[Megaphone, 'Admission campaign live', 'Live'], [Search, 'Google search ads', 'Live'], [Send, 'WhatsApp offer sent', 'Sent'], [PieChart, 'Weekly report ready', 'Ready']], meter: ['Monthly budget used', 58] },
    featuresTitle: 'What we run for you',
    features: [[Target, 'Campaign planning', 'Goals, audience and channels agreed before any spend.'], [TrendingUp, 'Paid ads', 'Google and Meta campaigns tied to enquiries.'], [Palette, 'Creatives', 'Ad designs, posters and short videos.'], [Send, 'Email & WhatsApp', 'Campaigns to customers who have opted in.'], [Search, 'SEO basics', 'Help people find you on Google.'], [PieChart, 'Reporting', 'Clear reports on spend, reach and enquiries.']],
    steps: serviceSteps(['Plan', 'We set the goal, audience and budget with you.'], ['Create', 'We prepare ads, posts and landing pages.'], ['Run', 'We launch and watch results daily.'], ['Report', 'We share results and shift budget to what works.']),
    fit: ['Education', 'Retail', 'Healthcare', 'SMEs'],
    faq: [['What is the minimum budget?', 'It depends on your goals and channels. We suggest a starting budget and adjust it based on results.'], ['Do you create the ad designs?', 'Yes. Our team prepares the creatives and shares them for your approval.'], ['How often will we get reports?', 'We agree a schedule with you, usually weekly during campaigns.']],
    cta: ['Let’s plan your next campaign.', 'Tell us who you want to reach. We will suggest channels and a starting budget.']
  },
  '/services/crm': {
    template: 'service', theme: ['#0b7a75', '#36c2a6'], icon: Contact, label: 'CRM',
    title: 'Every customer, every conversation, in one place',
    intro: 'Srisun sets up and customises CRM systems so your team knows who each customer is and what to do next.',
    mock: { title: 'Customer record', rows: [[Contact, 'Contact details updated', 'Saved'], [MessageCircle, 'WhatsApp chat logged', 'Synced'], [Tags, 'Tagged as repeat customer', 'Tagged'], [Bell, 'Renewal reminder set', 'Due']], meter: ['Profile completeness', 86] },
    featuresTitle: 'What your CRM can do',
    features: [[Database, 'Customer records', 'Contact details, history and notes in one profile.'], [Workflow, 'Pipelines', 'Track deals, admissions or cases through clear stages.'], [Tags, 'Segments', 'Group customers by interest, location or value.'], [Bell, 'Reminders & tasks', 'Automatic follow-ups assigned to the right person.'], [MessageCircle, 'Messaging links', 'Log calls, emails and WhatsApp chats automatically.'], [BarChart3, 'Dashboards', 'See activity and results for each team.']],
    steps: serviceSteps(['Discover', 'We learn how your team works with customers today.'], ['Configure', 'We set up fields, stages and permissions.'], ['Migrate', 'We move your existing contacts and history across.'], ['Adopt', 'We train users and refine the setup.']),
    fit: ['Education', 'Finance', 'Professional Services', 'Retail'],
    faq: [['Which CRM do you work with?', 'We recommend a platform after understanding your needs and budget, or customise the one you already use.'], ['Can you move our existing data?', 'Yes. We clean and import contacts and history from spreadsheets or your old system.'], ['Can the CRM connect to WhatsApp?', 'Yes, where the platform supports it. We confirm the options during setup.']],
    cta: ['Let’s bring your customer data together.', 'Tell us where your customer information lives today. We will suggest a CRM setup.']
  },
  '/services/forms': {
    template: 'service', theme: ['#2563eb', '#22b8cf'], icon: ListChecks, label: 'Forms',
    title: 'Online forms that collect the right information the first time',
    intro: 'Srisun builds admission, registration, feedback and payment forms that work on any phone and send data where you need it.',
    mock: { title: 'Admission form', rows: [[Users, 'Student details', 'Done'], [FileText, 'Documents uploaded', 'Done'], [CreditCard, 'Application fee paid', 'Paid'], [Mail, 'Confirmation email sent', 'Sent']], meter: ['Form completion', 90] },
    featuresTitle: 'Forms for every need',
    features: [[GraduationCap, 'Admission forms', 'Multi-step applications with document uploads.'], [ListChecks, 'Registrations', 'Events, courses and member sign-ups.'], [MessageCircle, 'Feedback & surveys', 'Collect opinions and ratings from customers or parents.'], [CreditCard, 'Payment forms', 'Take fees and orders with UPI and cards.'], [Workflow, 'Automatic routing', 'Send each response to the right person or system.'], [Smartphone, 'Mobile friendly', 'Easy to fill in on any phone.']],
    steps: serviceSteps(['List fields', 'We agree what information each form must collect.'], ['Design', 'We build a clear, step-by-step form.'], ['Connect', 'We send responses to email, sheets or your CRM.'], ['Launch', 'We test, publish and share the link.']),
    fit: ['Education', 'Healthcare', 'Professional Services', 'SMEs'],
    faq: [['Can people upload documents?', 'Yes. Forms can accept photos and PDFs, with size and type limits.'], ['Where do responses go?', 'To email, a spreadsheet, your CRM or a database, depending on your needs.'], ['Can forms take payments?', 'Yes. We can connect a payment gateway for fees and orders.']],
    cta: ['Let’s build your next form.', 'Tell us what you need to collect. We will suggest the right form setup.']
  },
  '/services/booking': {
    template: 'service', theme: ['#7c3aed', '#ec4899'], icon: CalendarCheck, label: 'Booking',
    title: 'Let customers book a time without calling you',
    intro: 'Srisun sets up online booking for appointments, classes and services, with reminders and payments built in.',
    mock: { title: 'Today’s bookings', rows: [[Clock, '10:00 Consultation', 'Booked'], [Clock, '11:30 Demo class', 'Booked'], [Bell, 'Reminder sent for 2:00', 'Sent'], [CreditCard, 'Advance payment received', 'Paid']], meter: ['Slots filled today', 68] },
    featuresTitle: 'What online booking includes',
    features: [[CalendarCheck, 'Online calendar', 'Customers pick from the slots you make available.'], [Bell, 'Reminders', 'SMS, email or WhatsApp reminders before each visit.'], [CreditCard, 'Advance payments', 'Collect deposits or full payment at booking.'], [Users, 'Staff schedules', 'Separate calendars for each person or room.'], [RefreshCcw, 'Easy rescheduling', 'Customers can change or cancel within your rules.'], [BarChart3, 'Booking reports', 'See busy hours, no-shows and revenue.']],
    steps: serviceSteps(['Plan', 'We list your services, durations and staff.'], ['Set up', 'We configure the calendar, rules and reminders.'], ['Connect', 'We add booking to your website and WhatsApp.'], ['Launch', 'We test bookings end to end and go live.']),
    fit: ['Healthcare', 'Education', 'Professional Services', 'Retail'],
    faq: [['Can customers book from our website?', 'Yes. We add a booking page or widget to your site.'], ['Can we take payment when someone books?', 'Yes. Deposits or full payment can be collected through a payment gateway.'], ['Do customers get reminders?', 'Yes. Reminders can go by SMS, email or WhatsApp.']],
    cta: ['Let’s open your calendar online.', 'Tell us what customers book with you. We will suggest a booking setup.']
  },
  '/services/domain-server': {
    template: 'service', theme: ['#0f766e', '#0ea5e9'], icon: Server, label: 'Domain / Server',
    title: 'Domains, hosting and email that stay online',
    intro: 'Srisun registers domains, sets up hosting and business email, and keeps your servers secure and backed up.',
    mock: { title: 'Server status', rows: [[Globe, 'yourschool.in renewed', 'Active'], [Lock, 'SSL certificate valid', 'Secure'], [HardDrive, 'Nightly backup complete', 'Done'], [Mail, 'Business email working', 'Online']], meter: ['Disk space used', 41] },
    featuresTitle: 'What we manage',
    features: [[Globe, 'Domain registration', 'Find, register and renew the right domain.'], [Server, 'Web hosting', 'Hosting sized for your website and traffic.'], [Mail, 'Business email', 'Professional email addresses on your own domain.'], [Lock, 'SSL certificates', 'Secure HTTPS for every site.'], [HardDrive, 'Backups', 'Regular backups you can restore from.'], [KeyRound, 'Access control', 'Safe, shared access for your team and vendors.']],
    steps: serviceSteps(['Audit', 'We check your current domains, hosting and email.'], ['Plan', 'We suggest the right setup and any moves needed.'], ['Migrate', 'We move sites and email with minimal downtime.'], ['Maintain', 'We handle renewals, updates and backups.']),
    fit: ['Education', 'SMEs', 'Professional Services', 'Retail'],
    faq: [['Can you move our existing website?', 'Yes. We plan the move to keep downtime short and check everything after it.'], ['Will you handle renewals?', 'Yes. We track renewal dates for domains and certificates so nothing expires.'], ['Can we get email on our own domain?', 'Yes. We set up business email addresses and connect them to your devices.']],
    cta: ['Let’s keep your site online.', 'Tell us about your domains and hosting today. We will suggest a setup.']
  },

  /* ───────────────────────── INDUSTRIES ───────────────────────── */
  '/industries/education': {
    template: 'industry', theme: ['#1d4ed8', '#f59e0b'], icon: GraduationCap, label: 'Education',
    title: 'Technology that makes school and college life simpler',
    intro: 'Srisun works with schools, colleges and training institutes on admissions, communication, websites and day-to-day administration.',
    challenges: [['Admissions on paper', 'Forms, documents and fee payments handled by hand each season.'], ['Scattered communication', 'Parent and student updates spread across calls, notes and groups.'], ['Outdated websites', 'Sites that are hard to update and hard to use on a phone.'], ['Manual reports', 'Attendance, fees and results compiled in spreadsheets.']],
    solutions: [[ListChecks, 'Online admissions', 'Application forms with uploads and fee payment.', '/services/forms'], [MessageCircle, 'Parent communication', 'WhatsApp and SMS updates for fees, events and results.', '/solutions/business-communication'], [Monitor, 'School websites', 'Fast, mobile-friendly sites your staff can update.', '/solutions/web-and-e-commerce'], [Boxes, 'Campus management', 'Fees, attendance and records in one system.', '/solutions/software-and-apps']],
    starters: ['Move admissions online before the next season', 'Send fee reminders by WhatsApp', 'Refresh the school website'],
    showClients: true, clientsTitle: 'Schools and colleges that work with Srisun',
    faq: [['Do you work with schools as well as colleges?', 'Yes. Srisun works with schools, colleges and training institutes.'], ['Can parents pay fees online?', 'Yes. We can add online fee payment with UPI and cards.'], ['Can our staff update the website?', 'Yes. We build on platforms your team can edit, and train them.']]
  },
  '/industries/finance': {
    template: 'industry', theme: ['#0f5132', '#c9a227'], icon: Landmark, label: 'Finance',
    title: 'Secure, clear systems for financial services',
    intro: 'Srisun builds software, automation and security for lenders, cooperatives and financial service firms.',
    challenges: [['Slow loan processing', 'Applications and documents passed by hand between teams.'], ['Security pressure', 'Customer data and transactions that must stay protected.'], ['Follow-up gaps', 'Repayment and renewal reminders that are easy to miss.'], ['Limited visibility', 'Reports pieced together from different systems.']],
    solutions: [[Workflow, 'Application workflows', 'Digital applications, document checks and approvals.', '/solutions/software-and-apps'], [ShieldCheck, 'Security reviews', 'Find and fix gaps in systems and access.', '/solutions/cybersecurity'], [Bell, 'Automated reminders', 'Repayment and renewal reminders by SMS and WhatsApp.', '/solutions/business-communication'], [BarChart3, 'Dashboards', 'Portfolio and collection reports in one view.', '/solutions/ai-and-automation']],
    starters: ['Digitise the loan application form', 'Automate repayment reminders', 'Run a security review'],
    faq: [['Can you work with our existing core system?', 'Where it offers an API or export, yes. We confirm the options during discovery.'], ['How do you handle customer data?', 'We plan access, storage and logging with you, and connect only what each feature needs.'], ['Can reminders go out automatically?', 'Yes. Reminders can be triggered from due dates in your system.']]
  },
  '/industries/retail': {
    template: 'industry', theme: ['#c2410c', '#facc15'], icon: Store, label: 'Retail',
    title: 'Sell in store, online and on WhatsApp',
    intro: 'Srisun helps shops and retail brands run online stores, manage stock and keep customers coming back.',
    challenges: [['Online and offline in silos', 'Stock and orders tracked separately for each channel.'], ['Customers who buy once', 'No simple way to reach past buyers with offers.'], ['Manual stock counts', 'Out-of-stock surprises and over-ordering.'], ['Slow checkout', 'Payment options that do not match how customers pay.']],
    solutions: [[Store, 'Online stores', 'Shopify, WooCommerce or custom stores linked to your stock.', '/solutions/web-and-e-commerce'], [Boxes, 'Inventory & billing', 'One view of stock across shop and website.', '/services/erp'], [Send, 'WhatsApp marketing', 'Offers and updates for customers who opted in.', '/solutions/business-communication'], [Megaphone, 'Local ads', 'Campaigns that bring nearby shoppers in.', '/services/marketing']],
    starters: ['Launch a simple online store', 'Connect stock across channels', 'Start a WhatsApp customer list'],
    faq: [['Can the online store share stock with our shop?', 'Yes. We can connect the store to your billing or inventory system.'], ['Do you support UPI payments?', 'Yes. We set up payment gateways with UPI, cards and wallets.'], ['Can you run our ads?', 'Yes. Srisun runs Google and Meta campaigns and reports results.']]
  },
  '/industries/manufacturing': {
    template: 'industry', theme: ['#334155', '#f97316'], icon: Factory, label: 'Manufacturing',
    title: 'Connected systems from purchase to dispatch',
    intro: 'Srisun helps manufacturers link production, stock, quality and orders so teams work from the same information.',
    challenges: [['Spreadsheet planning', 'Production plans and stock kept in separate files.'], ['Little shop-floor visibility', 'Managers chase updates by phone.'], ['Paper quality checks', 'Inspection records that are hard to find later.'], ['Disconnected orders', 'Sales, purchase and dispatch not in step.']],
    solutions: [[Boxes, 'ERP for production', 'Planning, stock, purchase and dispatch in one system.', '/services/erp'], [Smartphone, 'Shop-floor apps', 'Simple mobile apps for updates and checklists.', '/solutions/software-and-apps'], [BarChart3, 'Production dashboards', 'Output, delays and stock levels at a glance.', '/solutions/ai-and-automation'], [ShieldCheck, 'Plant IT security', 'Protect systems, devices and access.', '/solutions/cybersecurity']],
    starters: ['Map your order-to-dispatch flow', 'Digitise quality checklists', 'Set up a stock dashboard'],
    faq: [['Can you work with our existing machines and software?', 'We review what your systems can share and plan integrations where possible.'], ['Do we need a full ERP?', 'Not always. We start with the process that causes most delays and grow from there.'], ['Can supervisors use phones on the floor?', 'Yes. We build simple mobile screens for updates and checklists.']]
  },
  '/industries/healthcare': {
    template: 'industry', theme: ['#0e7490', '#10b981'], icon: Stethoscope, label: 'Healthcare',
    title: 'Less paperwork, smoother patient visits',
    intro: 'Srisun helps clinics, hospitals and diagnostic centres with appointments, patient communication, websites and data security.',
    challenges: [['Phone-only bookings', 'Front desks busy with calls for every appointment.'], ['Missed appointments', 'No reminders before visits.'], ['Sensitive records', 'Patient data that must stay private and secure.'], ['Hard-to-find information', 'Websites that do not answer common patient questions.']],
    solutions: [[CalendarCheck, 'Online appointments', 'Patients book slots by doctor and service.', '/services/booking'], [Bell, 'Visit reminders', 'SMS and WhatsApp reminders before each visit.', '/solutions/business-communication'], [Lock, 'Data protection', 'Access control, backups and security reviews.', '/solutions/cybersecurity'], [Monitor, 'Clinic websites', 'Doctors, services, timings and directions on any phone.', '/solutions/web-and-e-commerce']],
    starters: ['Add online booking to your website', 'Send automatic visit reminders', 'Review patient data access'],
    faq: [['Can patients book with a specific doctor?', 'Yes. Each doctor can have their own calendar and slots.'], ['How is patient data protected?', 'We set up access control, backups and security checks, and agree data handling with you.'], ['Can reports be shared with patients online?', 'We can discuss secure sharing options based on your systems.']]
  },
  '/industries/professional-services': {
    template: 'industry', theme: ['#4338ca', '#06b6d4'], icon: Briefcase, label: 'Professional Services',
    title: 'Run your practice with less admin',
    intro: 'Srisun helps consultants, agencies, CA firms and law practices manage clients, documents and billing in one place.',
    challenges: [['Client details everywhere', 'Notes, emails and files spread across inboxes.'], ['Manual billing', 'Invoices and payment follow-ups done by hand.'], ['Slow onboarding', 'New clients fill the same forms again and again.'], ['Hard to track time', 'Little view of where hours go.']],
    solutions: [[Contact, 'Client CRM', 'Every client, contact and conversation in one record.', '/services/crm'], [ListChecks, 'Onboarding forms', 'Collect documents and details online.', '/services/forms'], [Receipt, 'Billing workflows', 'Invoices, reminders and payment links.', '/solutions/software-and-apps'], [CalendarCheck, 'Meeting booking', 'Clients book consultations online.', '/services/booking']],
    starters: ['Set up a simple client CRM', 'Move onboarding online', 'Automate invoice reminders'],
    faq: [['Can documents be collected securely?', 'Yes. We set up forms and storage with access limited to your team.'], ['Can you connect billing to our accounting software?', 'Where it offers an API or import, yes.'], ['Is this suitable for small firms?', 'Yes. We size the setup to your team and grow it as you do.']]
  },
  '/industries/smes': {
    template: 'industry', theme: ['#b45309', '#16a34a'], icon: Building2, label: 'SMEs',
    title: 'Grown-up technology for growing businesses',
    intro: 'Srisun helps small and medium businesses get online, organise operations and protect what they build, one step at a time.',
    challenges: [['No time for IT', 'Owners handle technology on top of everything else.'], ['Too many tools', 'Separate apps that do not talk to each other.'], ['Weak online presence', 'Customers cannot find or trust the business online.'], ['Security as an afterthought', 'Shared passwords and no backups.']],
    solutions: [[Monitor, 'Website & store', 'A professional site or online store.', '/solutions/web-and-e-commerce'], [Boxes, 'Simple ERP', 'Billing, stock and accounts in one place.', '/services/erp'], [Megaphone, 'Local marketing', 'Ads and social posts that bring enquiries.', '/solutions/digital-growth'], [ShieldCheck, 'Basic security', 'Backups, access control and staff awareness.', '/solutions/cybersecurity']],
    starters: ['Launch or refresh your website', 'Put billing and stock in one system', 'Set up backups and secure logins'],
    faq: [['We have a small budget. Where should we start?', 'Start with the problem that costs you most time or sales. We will suggest one first step.'], ['Can you be our IT team?', 'Srisun can handle ongoing support for your website, systems and security.'], ['Do we need to change everything at once?', 'No. We plan changes in small steps.']]
  },

  /* ───────────────────────── PRODUCTS ───────────────────────── */
  '/products/srisun-one': {
    template: 'product', theme: ['#e50920', '#1688ff'], mark: 'One', tagline: 'One partner for your website, apps, AI, messaging and marketing.',
    intro: 'Srisun One brings Srisun services together so you work with a single team instead of many vendors.',
    prepare: [[Layers, 'The tools you use today', 'List your website, apps and services so we can see what to bring together.'], [Users, 'Who is involved', 'The teams and vendors who look after each part.'], [Target, 'What you want to improve', 'The problems you want one partner to solve first.']]
  },
  '/products/srisun-ai': {
    template: 'product', theme: ['#5b21b6', '#06b6d4'], mark: 'AI', tagline: 'AI agents and automation, shaped around your data and controls.',
    intro: 'Explore AI and automation opportunities with the Srisun team, including use cases, data and the controls your organisation needs.',
    prepare: [[ListChecks, 'Repetitive tasks', 'The tasks that take your team the most time each week.'], [Database, 'Where your data lives', 'Spreadsheets, software and documents the AI may need.'], [ShieldCheck, 'Your limits', 'What the AI must never do without a person approving it.']]
  },
  '/products/srisun-books': {
    template: 'product', theme: ['#047857', '#84cc16'], mark: 'Books', tagline: 'See whether Srisun Books fits the way you work.',
    intro: 'Ask the Srisun team about the current capabilities and availability of Srisun Books.',
    prepare: [[FileText, 'Your current process', 'How records are kept today and the tools you use.'], [Users, 'Who will use it', 'The people and roles that need access.'], [Calendar, 'Your timeline', 'When you would like to start.']]
  },
  '/products/srisun-social': {
    template: 'product', theme: ['#db2777', '#f97316'], mark: 'Social', tagline: 'Ask how Srisun Social can fit your communication needs.',
    intro: 'Share how your organisation communicates today, and the Srisun team will walk you through Srisun Social.',
    prepare: [[MessageCircle, 'Your channels', 'Where you talk to customers, members or students today.'], [Users, 'Your audience', 'Who you want to reach and how often.'], [Target, 'Your goals', 'What better communication should change for you.']]
  },
  '/products/zedu': {
    template: 'product', theme: ['#2563eb', '#facc15'], mark: 'Zedu', tagline: 'Share your education and learning needs, and see where Zedu fits.',
    intro: 'Learn more about Zedu by sharing your education and learning requirements with Srisun.',
    prepare: [[GraduationCap, 'Your institution', 'School, college, coaching centre or training team.'], [Users, 'Your learners', 'Who learns, how many, and how they study today.'], [ListChecks, 'Your must-haves', 'The features you need from day one.']]
  },
  '/products/xloan': {
    template: 'product', theme: ['#0f766e', '#22c55e'], mark: 'XLoan', tagline: 'Get current information on XLoan and its availability.',
    intro: 'Contact Srisun for current information about XLoan and how it may fit your organisation.',
    prepare: [[Briefcase, 'Your organisation', 'The type of lending or financial service you offer.'], [Workflow, 'Your current process', 'How applications move from enquiry to decision today.'], [Calendar, 'Your timeline', 'When you would like to start.']]
  },

  /* ───────────────────────── PARTNERS ───────────────────────── */
  '/partners/partner-program': {
    template: 'partner', theme: ['#e50920', '#f59e0b'], icon: Handshake, label: 'Partner Program',
    title: 'Grow together with Srisun',
    intro: 'The Srisun Partner Program is for organisations that want to build, sell or deliver technology with us.',
    who: [[Plug, 'Technology providers', 'Platforms and tools that fit alongside Srisun services.'], [Store, 'Resellers', 'Businesses that serve customers who need what Srisun offers.'], [Users, 'Agencies & consultants', 'Teams that want a delivery partner for client work.']],
    share: ['Your organisation and location', 'The services or products you offer', 'The customers you serve', 'The kind of collaboration you have in mind']
  },
  '/partners/technology-partners': {
    template: 'partner', theme: ['#2563eb', '#06b6d4'], icon: Network, label: 'Technology Partners',
    title: 'Build better solutions with your technology',
    intro: 'Partner with Srisun if your platform, product or tool can help our customers do more.',
    who: [[Cloud, 'Software platforms', 'SaaS, cloud and business tools.'], [Bot, 'AI and data products', 'Tools for automation, analytics and AI.'], [ShieldCheck, 'Security vendors', 'Products that protect data, devices and access.']],
    share: ['Your product and what it does', 'Who uses it today', 'How it connects with other systems', 'How you see us working together']
  },
  '/partners/reseller-partners': {
    template: 'partner', theme: ['#c2410c', '#eab308'], icon: Store, label: 'Reseller Partners',
    title: 'Offer Srisun services to your customers',
    intro: 'For businesses that want to add websites, software, AI or security services to what they already sell.',
    who: [[Store, 'IT and hardware sellers', 'Shops and distributors with business customers.'], [Briefcase, 'Service providers', 'Firms whose customers ask for digital help.'], [MapPin, 'Regional businesses', 'Organisations with strong local customer networks.']],
    share: ['Your business and the region you serve', 'The customers you sell to', 'Which Srisun services interest you', 'How you sell today']
  },
  '/partners/integration-partners': {
    template: 'partner', theme: ['#0f766e', '#8b5cf6'], icon: Link2, label: 'Integration Partners',
    title: 'Connect your product with Srisun projects',
    intro: 'For teams whose APIs and connectors help Srisun customers link their systems together.',
    who: [[Plug, 'API providers', 'Payment, messaging, accounting and other services with APIs.'], [Workflow, 'Integration platforms', 'Tools that move data between apps.'], [Database, 'Data services', 'Products that store, clean or analyse data.']],
    share: ['Your product and its API', 'Documentation or sandbox access', 'Common customer use cases', 'Who to contact on your team']
  },
  '/partners/strategic-partnerships': {
    template: 'partner', theme: ['#1e3a8a', '#e50920'], icon: Award, label: 'Strategic Partnerships',
    title: 'Long-term collaboration on shared goals',
    intro: 'For institutions and organisations that want to work with Srisun on larger initiatives over time.',
    who: [[GraduationCap, 'Institutions', 'Colleges, universities and training bodies.'], [Building2, 'Organisations', 'Companies planning multi-year technology programmes.'], [Heart, 'Community initiatives', 'Programmes that bring technology to more people.']],
    share: ['Your organisation and its goals', 'The initiative you have in mind', 'The people involved', 'Your expected timeline']
  },
  '/partners/affiliate-program': {
    template: 'partner', theme: ['#db2777', '#8b5cf6'], icon: Gift, label: 'Affiliate Program',
    title: 'Introduce customers to Srisun',
    intro: 'For people and organisations who know businesses that need Srisun services and want to make introductions.',
    who: [[Users, 'Consultants & advisors', 'People whose clients ask for technology help.'], [Megaphone, 'Creators & communities', 'Groups with audiences of business owners.'], [Briefcase, 'Freelancers', 'Specialists who work with growing businesses.']],
    share: ['Who you are and what you do', 'The audience or network you reach', 'The kinds of customers you could introduce', 'How you would like to work with us']
  },

  /* ───────────────────────── RESOURCES ───────────────────────── */
  '/resources/announcements': {
    template: 'resource', variant: 'timeline', theme: ['#e50920', '#1688ff'], icon: Newspaper, label: 'Announcements Hub',
    title: 'News and updates from Srisun',
    intro: 'Company news, product updates and announcements will be published here.',
    topics: ['Company news', 'Product updates', 'New services', 'Events'],
    panelTitle: 'Want the latest now?', panelText: 'Contact the team and we will share recent updates with you.', panelCta: ['Contact Us for Updates', '/contact-us']
  },
  '/resources/blog': {
    template: 'resource', variant: 'grid', theme: ['#2563eb', '#8b5cf6'], icon: PenLine, label: 'Blog',
    title: 'Ideas on technology and better ways of working',
    intro: 'Perspectives from the Srisun team on websites, software, AI, security and growing a business.',
    topics: ['Websites & stores', 'Software & apps', 'AI & automation', 'Cybersecurity', 'Digital growth'],
    panelTitle: 'Have a question for our team?', panelText: 'Tell us what you would like to read about, or ask us directly.', panelCta: ['Ask Srisun', '/contact-us']
  },
  '/resources/shri-ai-agent': {
    template: 'resource', variant: 'chat', theme: ['#7c3aed', '#06b6d4'], icon: Bot, label: 'Shri (AI Agent)',
    title: 'Meet Shri, Srisun’s AI agent initiative',
    intro: 'Shri is Srisun’s work on AI agents. Ask the team about current capabilities and where Shri could help you.',
    topics: ['Answering questions', 'Finding information', 'Drafting replies', 'Routing requests'],
    chat: ['Hi, I’m Shri. How can I help?', 'Which service fits a new school website?', 'Let me connect you with the Srisun team for that.'],
    panelTitle: 'Curious about Shri?', panelText: 'Ask the team what Shri can do today and what is planned.', panelCta: ['Ask About Shri', '/contact-us']
  },
  '/resources/newsletter': {
    template: 'resource', variant: 'mail', theme: ['#0f766e', '#f59e0b'], icon: Mail, label: 'Newsletter',
    title: 'Srisun updates in your inbox',
    intro: 'Get in touch to ask about Srisun updates and future newsletter editions.',
    topics: ['Practical technology tips', 'Srisun news', 'New services', 'Client stories'],
    panelTitle: 'Want to hear from us?', panelText: 'Share your email with the team and ask to be added to future editions.', panelCta: ['Ask to Subscribe', '/contact-us']
  },
  '/resources/the-long-game': {
    template: 'resource', variant: 'quote', theme: ['#1e293b', '#e2a900'], icon: Compass, label: 'The Long Game',
    title: 'Building technology that lasts',
    intro: 'Ideas on building useful technology and long-term digital capability.',
    quote: 'Good technology is not a one-time project. It is a capability you keep building.',
    topics: ['Long-term thinking', 'Digital capability', 'Useful technology', 'Learning teams'],
    panelTitle: 'Planning for the long term?', panelText: 'Talk to Srisun about building capability step by step.', panelCta: ['Start a Conversation', '/contact-us']
  },
  '/resources/knowledge-base': {
    template: 'resource', variant: 'search', theme: ['#0369a1', '#22c55e'], icon: BookOpen, label: 'Knowledge Base',
    title: 'Help with your Srisun product or service',
    intro: 'Find support for a Srisun product or service by contacting the team. Pick a topic to get started.',
    topics: ['Websites & hosting', 'Apps & software', 'ERP & CRM', 'Email & domains', 'Security', 'Billing'],
    panelTitle: 'Need help now?', panelText: 'Tell the team which product or service you need help with.', panelCta: ['Contact Support', '/contact-us']
  },
  '/resources/concierge': {
    template: 'resource', variant: 'route', theme: ['#e50920', '#7c3aed'], icon: LifeBuoy, label: 'Concierge',
    title: 'Tell us what you need. We will point the way.',
    intro: 'Not sure where to start? Pick what sounds closest, or contact the team and we will direct your enquiry.',
    routes: [['I need a website or online store', '/solutions/web-and-e-commerce'], ['I want to automate repetitive work', '/solutions/ai-and-automation'], ['I need custom software or an app', '/solutions/software-and-apps'], ['I am worried about security', '/solutions/cybersecurity'], ['I want more enquiries', '/solutions/digital-growth'], ['I need expert advice first', '/solutions/tech-consulting']],
    panelTitle: 'Still not sure?', panelText: 'Describe what you need and we will direct your enquiry.', panelCta: ['Talk to Concierge', '/contact-us']
  },

  /* ───────────────────────── COMPANY ───────────────────────── */
  '/company/about-srisun': { template: 'about', theme: ['#e50920', '#1688ff'] },
  '/company/our-story': { template: 'story', theme: ['#1688ff', '#e2a900'] },
  '/company/brand-guidelines': { template: 'brand', theme: ['#e50920', '#079b68'] },

  /* ───────────────────────── DIRECTORIES ───────────────────────── */
  '/services': {
    template: 'directory', theme: ['#e50920', '#f59e0b'], eyebrow: 'SERVICES', title: 'Services to plan, build and run your business',
    intro: 'Pick a service to see what is included, how it works and how to start.',
    items: [[Target, 'Sales', 'Pipelines, follow-ups and sales reports.', '/services/sales'], [Boxes, 'ERP', 'Finance, stock and operations in one system.', '/services/erp'], [Scale, 'Legal', 'Policies, agreements and compliance checklists.', '/services/legal'], [Megaphone, 'Marketing', 'Campaigns across ads, social and WhatsApp.', '/services/marketing'], [Contact, 'CRM', 'Customer records and follow-ups in one place.', '/services/crm'], [ListChecks, 'Forms', 'Admission, registration and payment forms.', '/services/forms'], [CalendarCheck, 'Booking', 'Online appointments with reminders.', '/services/booking'], [Server, 'Domain / Server', 'Domains, hosting, email and backups.', '/services/domain-server']]
  },
  '/solutions': {
    template: 'directory', theme: ['#1237b5', '#0d6b6e'], eyebrow: 'SOLUTIONS', title: 'Solutions for every stage of growth',
    intro: 'From first advice to secure, automated operations. Choose where you want to start.',
    items: [[Compass, 'Tech Consulting', 'Clear technology decisions and roadmaps.', '/solutions/tech-consulting'], [Store, 'Web & E-Commerce', 'Websites and online stores that sell.', '/solutions/web-and-e-commerce'], [Smartphone, 'Software & Apps', 'Web apps, mobile apps and business software.', '/solutions/software-and-apps'], [Bot, 'AI & Automation', 'AI agents, workflows and analytics.', '/solutions/ai-and-automation'], [ShieldCheck, 'Cybersecurity', 'Reviews, protection and staff training.', '/solutions/cybersecurity'], [MessageCircle, 'Business Communication', 'WhatsApp, SMS and customer messaging.', '/solutions/business-communication'], [TrendingUp, 'Digital Growth', 'Branding, ads, SEO and content.', '/solutions/digital-growth']]
  },
  '/industries': {
    template: 'directory', theme: ['#1d4ed8', '#10b981'], eyebrow: 'INDUSTRIES', title: 'Technology shaped for your sector',
    intro: 'Each sector has its own problems. See how Srisun helps yours.',
    items: [[GraduationCap, 'Education', 'Admissions, communication and campus systems.', '/industries/education'], [Landmark, 'Finance', 'Secure workflows and automated reminders.', '/industries/finance'], [Store, 'Retail', 'Online stores, stock and customer marketing.', '/industries/retail'], [Factory, 'Manufacturing', 'Production, stock and dispatch connected.', '/industries/manufacturing'], [Stethoscope, 'Healthcare', 'Appointments, reminders and data security.', '/industries/healthcare'], [Briefcase, 'Professional Services', 'Client records, onboarding and billing.', '/industries/professional-services'], [Building2, 'SMEs', 'Practical first steps for growing businesses.', '/industries/smes']]
  },
  '/partners': {
    template: 'directory', theme: ['#e50920', '#8b5cf6'], eyebrow: 'PARTNERS', title: 'Work with Srisun as a partner',
    intro: 'Choose the partnership that matches what your organisation brings.',
    items: [[Handshake, 'Partner Program', 'An overview of how partners work with Srisun.', '/partners/partner-program'], [Network, 'Technology Partners', 'Platforms and tools that fit our solutions.', '/partners/technology-partners'], [Store, 'Reseller Partners', 'Offer Srisun services to your customers.', '/partners/reseller-partners'], [Link2, 'Integration Partners', 'APIs and connectors for customer projects.', '/partners/integration-partners'], [Award, 'Strategic Partnerships', 'Long-term collaboration on larger goals.', '/partners/strategic-partnerships'], [Gift, 'Affiliate Program', 'Introduce customers to Srisun.', '/partners/affiliate-program']]
  },
  '/products': {
    template: 'directory', theme: ['#5b21b6', '#e50920'], eyebrow: 'PRODUCTS', title: 'Srisun products and platforms',
    intro: 'Explore Srisun products. Contact the team to confirm current features, availability and fit.',
    items: [[Layers, 'Srisun One', 'One partner for web, apps, AI and marketing.', '/products/srisun-one'], [Sparkles, 'Srisun AI', 'AI agents and automation.', '/products/srisun-ai'], [BookOpen, 'Srisun Books', 'Ask about current capabilities.', '/products/srisun-books'], [Share2, 'Srisun Social', 'For your communication needs.', '/products/srisun-social'], [GraduationCap, 'Zedu', 'For education and learning needs.', '/products/zedu'], [Wallet, 'XLoan', 'Ask about availability.', '/products/xloan']]
  },
  '/clients': {
    template: 'directory', theme: ['#079b68', '#1688ff'], eyebrow: 'CLIENTS', title: 'The organisations we work with',
    intro: 'Schools, colleges and businesses across India. See their logos, our training programme and ways to work with us.',
    items: [[Users, 'Customer Stories', 'The institutions in the Srisun client portfolio.', '/clients/stories'], [Award, 'Training & Certifications', 'Courses from Srisun’s training institute.', 'https://sit.srisun.org/'], [Gift, 'Affiliate Program', 'Introduce new customers to Srisun.', '/partners/affiliate-program']],
    showClients: true
  },
  '/clients/stories': { template: 'stories', theme: ['#079b68', '#e2a900'] }
};

const policyIcons = { Security: ShieldCheck, Compliance: ClipboardList, 'IPR Complaints': Copyright, 'Terms of Service': FileSignature, 'Privacy Policy': Eye, 'Refund Policy': RefreshCcw, 'Trademark Policy': Flag, 'Cookie Policy': Cookie, 'GDPR Compliance': Fingerprint, 'Abuse Policy': Ban };
export const policyList = Object.keys(policyIcons).map((title) => ({ title, icon: policyIcons[title], href: `/legal/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` }));
policyList.forEach(({ title, href }) => { subpages[href] = { template: 'policy', theme: ['#172b4d', '#e50920'], label: title }; });

export const aboutValues = [[Users, 'People first', 'We design for whoever will use the product every day.'], [Lightbulb, 'Always learning', 'Each project teaches us something we bring to the next.'], [ShieldCheck, 'Honest updates', 'We tell you what we know, what we do not and what comes next.'], [Globe, 'No borders', 'Knowing local needs helps us build for any market.']];
export const aboutCapabilities = [[Compass, 'Consult', '/solutions/tech-consulting'], [Monitor, 'Build', '/solutions/software-and-apps'], [Bot, 'Automate', '/solutions/ai-and-automation'], [ShieldCheck, 'Protect', '/solutions/cybersecurity'], [MessageCircle, 'Connect', '/solutions/business-communication'], [TrendingUp, 'Grow', '/solutions/digital-growth']];
export const storyChapters = [[Sun, 'Roots', 'Srisun began in Tamil Nadu with a simple belief: good ideas can start anywhere.'], [Users, 'People', 'We listen to the people closest to each challenge before we build.'], [Rocket, 'Work', 'Our work grew to span consulting, websites, software, AI, security and growth.'], [Globe, 'Next', 'We keep learning, and keep building for organisations across India and beyond.']];
export const brandColours = [['Srisun Red', '#e50920', '--red'], ['Brand Blue', '#0182fc', '--brand-blue'], ['Accent Blue', '#1688ff', '--accent-blue'], ['Accent Green', '#079b68', '--accent-green'], ['Accent Yellow', '#e2a900', '--accent-yellow'], ['Navy', '#172b4d', '--navy']];
export const brandRules = [[Check, true, 'Use the official logo files supplied by the Srisun team.'], [Check, true, 'Keep clear space around the logo on every side.'], [Check, true, 'Use the brand colours exactly as listed.'], [Ban, false, 'Do not stretch, recolour or rotate the logo.'], [Ban, false, 'Do not add effects such as shadows or outlines.'], [Ban, false, 'Do not use the brand in public campaigns without approval.']];
