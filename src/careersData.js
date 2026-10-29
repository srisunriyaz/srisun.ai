// The roles that were on the site before jobs moved into the admin. They seed
// the jobs table once, and are the build-time fallback if the database is
// unreachable when the site is built.
export const openRoles = [
  {
    title: 'HR Executive',
    department: 'People & Culture',
    location: 'India · Multiple locations',
    type: 'Full time',
    summary: 'Support hiring, employee coordination and day-to-day people operations.',
    responsibilities: ['Coordinate interview schedules and communicate with candidates.', 'Support onboarding, employee records and HR documentation.', 'Work with teams to keep people processes organised and responsive.'],
    qualifications: ['Clear written and verbal communication.', 'Good organisation and attention to detail.', 'Interest in recruitment and employee experience.']
  },
  {
    title: 'Mobile/Web App Developer',
    department: 'Engineering & Technology',
    location: 'India · Multiple locations',
    type: 'Full time',
    summary: 'Develop useful web and mobile experiences for Srisun products and client projects.',
    responsibilities: ['Build and maintain responsive web or mobile app features.', 'Collaborate with design and engineering on user-focused solutions.', 'Test, improve and document product functionality.'],
    qualifications: ['Knowledge of app or web development fundamentals.', 'Experience with JavaScript or a mobile development framework.', 'A practical approach to debugging and teamwork.']
  },
  {
    title: 'Digital Marketing Interns',
    department: 'Marketing & Growth',
    location: 'India · Multiple locations',
    type: 'Internship',
    summary: 'Help plan and deliver digital campaigns, content and audience research.',
    responsibilities: ['Assist with social, email and web marketing activities.', 'Research topics, audiences and campaign performance.', 'Coordinate content and campaign tasks with the team.'],
    qualifications: ['Interest in digital marketing and content.', 'Good writing, research and communication skills.', 'Curiosity and willingness to learn.']
  },
  {
    title: 'Cybersecurity Interns',
    department: 'Security & Infrastructure',
    location: 'India · Multiple locations',
    type: 'Internship',
    summary: 'Learn security practices while supporting research, reviews and awareness activities.',
    responsibilities: ['Assist with security research and basic assessments.', 'Document findings and help track remediation tasks.', 'Support security awareness and internal best practices.'],
    qualifications: ['Foundational knowledge of networking or information security.', 'Analytical thinking and careful documentation.', 'Interest in learning security tools and methods.']
  },
  {
    title: 'AI Engineer Trainee',
    department: 'AI & Automation',
    location: 'India · Multiple locations',
    type: 'Trainee',
    summary: 'Contribute to AI prototypes and automation workflows while growing your engineering skills.',
    responsibilities: ['Support development and evaluation of AI-powered features.', 'Work with data, APIs and automation workflows.', 'Document experiments and share learnings with the team.'],
    qualifications: ['Programming fundamentals in Python or JavaScript.', 'Interest in machine learning, generative AI or automation.', 'Strong problem-solving and learning mindset.']
  },
  {
    title: 'Full Stack Engineer',
    department: 'Engineering & Technology',
    location: 'India · Multiple locations',
    type: 'Full time',
    summary: 'Build end-to-end product features across frontend, backend and data services.',
    responsibilities: ['Develop and maintain frontend and backend application features.', 'Design and integrate APIs and data models.', 'Work with the team to improve reliability, performance and quality.'],
    qualifications: ['Experience with frontend and backend web development.', 'Knowledge of APIs, databases and version control.', 'Ability to collaborate and solve problems across the stack.']
  }
];
