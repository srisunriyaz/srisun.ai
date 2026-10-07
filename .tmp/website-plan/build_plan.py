from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path.cwd()
TMP = ROOT / '.tmp' / 'website-plan'
TEMPLATE = Path(r'C:\Users\New\Downloads\2D Document Template.docx')
OUT = ROOT / 'Srisun_Full_Website_Redesign_Plan_Reviewed.docx'
NAVY = '#0C1B3A'; BLUE = '#1677D2'; RED = '#E53945'; YELLOW = '#F5B700'; GREEN = '#19A86B'; MUTED = '#64748B'; PALE = '#F4F7FB'; WHITE = '#FFFFFF'
FONT = r'C:\Windows\Fonts\arial.ttf'
BOLD = r'C:\Windows\Fonts\arialbd.ttf'

def font(size, bold=False):
    path = BOLD if bold and Path(BOLD).exists() else FONT
    try: return ImageFont.truetype(path, size)
    except: return ImageFont.load_default()

def make_diagram(path, title, nodes, subtitle=None):
    # nodes = [(label, detail, color)] placed in a horizontal flow, wrap is avoided by short labels.
    width, height = 1500, 410
    im = Image.new('RGB', (width, height), NAVY)
    d = ImageDraw.Draw(im)
    d.text((56, 34), title, font=font(34, True), fill=WHITE)
    if subtitle: d.text((58, 82), subtitle, font=font(19), fill='#D8E2F0')
    n = len(nodes); left, right = 55, width - 55; gap = 42
    box_w = (right-left-(n-1)*gap)//n
    y0, y1 = 170, 330
    for i,(label,detail,color) in enumerate(nodes):
        x = left + i*(box_w+gap)
        d.rounded_rectangle((x,y0,x+box_w,y1), radius=20, fill='#14294D', outline=color, width=4)
        lines = label.split('\n')
        y = y0 + 22
        for line in lines:
            bb = d.textbbox((0,0), line, font=font(23,True)); tw=bb[2]-bb[0]
            d.text((x+(box_w-tw)//2,y),line,font=font(23,True),fill=WHITE); y += 31
        for j,line in enumerate(detail.split('\n')):
            bb=d.textbbox((0,0),line,font=font(16)); tw=bb[2]-bb[0]
            d.text((x+(box_w-tw)//2,y+6+j*23),line,font=font(16),fill='#D8E2F0')
        if i < n-1:
            ax=x+box_w+7; ay=(y0+y1)//2; ex=ax+gap-14
            d.line((ax,ay,ex,ay), fill='#D8E2F0', width=4)
            d.polygon([(ex,ay),(ex-12,ay-9),(ex-12,ay+9)], fill='#D8E2F0')
    d.text((56, 366), 'SRISUN  |  WEBSITE DELIVERY PLAN', font=font(15,True), fill='#AFC3DF')
    im.save(path)

TMP.mkdir(parents=True, exist_ok=True)
existing_img = TMP / 'existing_architecture.png'
proposed_img = TMP / 'proposed_architecture.png'
steps_img = TMP / 'delivery_sequence.png'
make_diagram(existing_img,'Current website structure',[
    ('Visitor','Desktop / mobile',BLUE),('Vite + React','src/main.jsx\npath-based views',RED),('Shared styles','src/styles.css\nIBM Plex setup',YELLOW),('Static assets','public/assets\nlogos and images',GREEN),('External actions','mail links\nthird-party pages',BLUE)],
    'Current routes are limited to Home, Careers and Contact Us; many navigation items still use placeholder links.')
make_diagram(proposed_img,'Proposed page and content structure',[
    ('Home','Overview, services,\ntrust and CTA',BLUE),('Service pages','Sales, ERP, CRM,\nMarketing and more',RED),('Solutions + sectors','7 solution areas;\n7 industry pages',YELLOW),('Company pages','Clients, partners,\ncareers, contact',GREEN),('Search layer','Per-page metadata,\nsitemap and schema',BLUE)],
    'Keep React and Vite; add explicit route data, reusable page templates, and an approved content model.')
make_diagram(steps_img,'Implementation and release sequence',[
    ('1. Confirm','Content, contacts,\nform destination',RED),('2. Build','Design system,\nroutes and pages',BLUE),('3. Optimize','SEO, GEO, AEO,\naccessibility',YELLOW),('4. Review','Link, mobile,\nform and metadata QA',GREEN),('5. Launch','Hosting, analytics,\nmonitoring and rollback',BLUE)],
    'Production release depends on confirmed hosting and access to the chosen analytics and search tools.')

# Reuse the supplied document's geometry, header/footer, theme and paragraph styles.
doc = Document(TEMPLATE)
body = doc._element.body
for child in list(body):
    if child.tag != qn('w:sectPr'):
        body.remove(child)

# Stable compact typography on top of the template's styles.
normal = doc.styles['Normal']
normal.font.name = 'Arial'; normal.font.size = Pt(11); normal.font.color.rgb = RGBColor(32,43,61)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.12
for name in ['Title','Heading 1','Heading 2']:
    st=doc.styles[name]; st.font.name='Arial'; st.font.color.rgb=RGBColor(12,27,58)
for nm in ['Title','Heading 1','Heading 2']:
    st=doc.styles[nm]
    if st._element.rPr is None: st._element.get_or_add_rPr()
    rfonts=st._element.rPr.rFonts
    if rfonts is None: rfonts=OxmlElement('w:rFonts'); st._element.rPr.insert(0,rfonts)
    rfonts.set(qn('w:ascii'),'Arial'); rfonts.set(qn('w:hAnsi'),'Arial')

def add_text(text='', style=None, bold_prefix=None, keep=False):
    p=doc.add_paragraph(style=style)
    if bold_prefix and text.startswith(bold_prefix):
        p.add_run(bold_prefix).bold=True; p.add_run(text[len(bold_prefix):])
    else: p.add_run(text)
    if keep: p.paragraph_format.keep_together=True
    return p

def heading(text):
    return doc.add_paragraph(text, style='Heading 1')

def bullet(text):
    p=doc.add_paragraph(style='Normal')
    p.paragraph_format.space_after=Pt(3)
    p.add_run(text)
    return p

def page_break(): doc.add_page_break()

def set_cell_shading(cell, color):
    tcPr=cell._tc.get_or_add_tcPr(); shd=OxmlElement('w:shd'); shd.set(qn('w:fill'),color.lstrip('#')); tcPr.append(shd)

def set_cell_border(cell, color='D8E2F0'):
    tcPr=cell._tc.get_or_add_tcPr(); borders=tcPr.first_child_found_in('w:tcBorders')
    if borders is None: borders=OxmlElement('w:tcBorders'); tcPr.append(borders)
    for edge in ('top','left','bottom','right','insideH','insideV'):
        tag='w:'+edge; el=borders.find(qn(tag))
        if el is None: el=OxmlElement(tag); borders.append(el)
        el.set(qn('w:val'),'single'); el.set(qn('w:sz'),'5'); el.set(qn('w:color'),color.lstrip('#'))

def add_card_table(rows, widths=None):
    table=doc.add_table(rows=0, cols=2)
    table.alignment=WD_TABLE_ALIGNMENT.CENTER; table.autofit=False
    usable=6.25
    table.columns[0].width=Inches(1.62); table.columns[1].width=Inches(usable-1.62)
    for label,bodytxt in rows:
        cells=table.add_row().cells
        cells[0].width=Inches(1.62); cells[1].width=Inches(usable-1.62)
        for c in cells: c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER; set_cell_border(c)
        set_cell_shading(cells[0], 'EAF1FA'); set_cell_shading(cells[1], 'FFFFFF')
        p=cells[0].paragraphs[0]; p.paragraph_format.space_after=Pt(0); r=p.add_run(label); r.bold=True; r.font.color.rgb=RGBColor(12,27,58)
        p=cells[1].paragraphs[0]; p.paragraph_format.space_after=Pt(1); p.add_run(bodytxt)
    return table

def add_image(path, width=6.25):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before=Pt(4); p.paragraph_format.space_after=Pt(6)
    p.add_run().add_picture(str(path), width=Inches(width))

def add_caption(text):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_after=Pt(10)
    r=p.add_run(text); r.italic=True; r.font.size=Pt(9); r.font.color.rgb=RGBColor(100,116,139)

# Cover / project identity, preserving the template's Title and Subtitle hierarchy.
p=doc.add_paragraph('SRISUN FULL WEBSITE REDESIGN', style='Title'); p.paragraph_format.space_before=Pt(18)
p=doc.add_paragraph('Implementation plan for a complete, Zoho-inspired website', style='Subtitle')
p=doc.add_paragraph('Prepared for the Srisun website project'); p.paragraph_format.space_before=Pt(8)
p=doc.add_paragraph('Scope: page structure, navigation, visual system, working links, search foundations and release approach.'); p.paragraph_format.space_after=Pt(18)
heading('Description')
add_text('This plan describes how we will expand the existing Srisun React and Vite site into a connected multi-page experience. It uses Zoho.com as a design reference while keeping Srisun branding, the established IBM Plex font, the 1,240-pixel desktop content width and the logo’s four-color accents.')
add_text('The work covers the home page, service and solution pages, industry pages, company and resource pages, careers, contact, navigation, internal links, SEO, GEO and AEO foundations. SEO means search engine optimization; GEO means generative engine optimization; AEO means answer engine optimization.')
heading('Table of Contents:')
for item in ['Introduction','Background:','Problem Statement:','Existing Architecture:','Proposed Architecture','Deployment Steps:','Conclusion']:
    bullet(item)
page_break()

heading('Introduction')
add_text('We will turn the current Srisun site into a complete set of linked pages that explains what the company offers, who it serves and how visitors can take the next step. The design will take cues from Zoho.com’s clear navigation, editorial sections, customer proof and strong calls to action, while using Srisun’s own content and visual identity.')
add_text('The implementation will retain the current React and Vite foundation unless code inspection during delivery identifies a concrete reason to change it. It will use responsive layouts, shared page components and direct URLs for each page so visitors and search engines can reach content without relying on menu state.')
add_text('The first delivery milestone is the approved page map and content inventory. The next milestone is the complete site and the final handoff document listing remaining owner tasks, access needs and follow-up work.')
heading('Background:')
add_text('The current project is a React single-page application with Vite. The main interface and route-dependent rendering are in src/main.jsx, global layout and typography are in src/styles.css, and static imagery is served from public/assets. The package manifest lists React, Vite and lucide-react.')
add_text('The site already contains home, careers and contact experiences. The home page has product and service sections, trusted brands, customer stories, enterprise content, industries, values and India impact. Careers includes six open-role examples and an application flow. Contact Us includes office details and an embedded map.')
add_text('Current navigation already groups service, solution, industry, client, partner and resource topics. Several destinations still use placeholder links, and the inspected project does not show a CMS, application API or confirmed production hosting configuration. These items will be checked before launch.')
heading('Problem Statement:')
add_text('Visitors cannot yet follow every top-level and submenu item to a complete destination. This makes the site feel unfinished and limits how clearly Srisun can explain each service, solution, industry and resource area.')
add_text('Search engines and answer systems also need stable page URLs, descriptive titles, useful page copy, consistent organization details and structured data that matches visible content. The existing project has only a small number of route-specific titles; a site-wide metadata and indexing plan is required.')
add_text('The finished site must keep the reference-led visual quality while giving every page a clear purpose, usable mobile layout, meaningful internal links and a realistic launch checklist. Search visibility cannot be guaranteed by implementation alone; it depends on content accuracy, indexing, competition and ongoing publishing.')
page_break()

heading('Existing Architecture:')
add_text('The current front end is a client-rendered React application. The diagram summarizes what was visible in the supplied workspace during planning. It does not imply that a separate API, CMS or production server has been configured.')
add_image(existing_img)
add_caption('Current structure based on package.json, src/main.jsx, src/styles.css and public assets.')
add_card_table([
 ('Presentation','React components render the home, careers and contact experiences.'),
 ('Routing','The application selects views from the browser path; only a small set of routes is present.'),
 ('Styling and media','Global CSS and static files provide layout, logos and images.'),
 ('Forms and integrations','Contact and job application flows need destination and data-handling confirmation before production use.'),
 ('Navigation','Menu groups exist, but multiple destinations remain placeholders and must be mapped to real pages.')])
add_text('Planning constraint: avoid adding a content service, database or applicant backend until the site owner confirms that one is needed and identifies the system that will receive the data.')
page_break()

heading('Proposed Architecture')
add_text('Keep the current React and Vite application and organize it around reusable page templates, explicit route data and a single source for global navigation and footer links. Each route will render its own headings, content, metadata and calls to action. Shared components will keep the header, mega menu, breadcrumb, buttons, cards and footer consistent. The production build will prerender route HTML with page content and metadata, then hydrate those pages in the browser.')
add_image(proposed_img)
add_caption('Proposed page groups and site-wide search layer.')
add_text('Proposed sitemap and route families')
add_card_table([
 ('Home','/'),
 ('Services','/services/ plus Sales, ERP, Legal, Marketing, CRM, Forms, Booking, and Domain and Server pages.'),
 ('Solutions','/solutions/ plus Tech Consulting, Web and E-commerce, Software and Apps, AI and Automation, Cybersecurity, Business Communication, and Digital Growth.'),
 ('Industries','/industries/ plus Education, Finance, Retail, Manufacturing, Healthcare, Professional Services, and SMEs.'),
 ('Products','/products/ plus Srisun One, Srisun AI, Srisun Books, Srisun Social, Zedu, and XLoan.'),
 ('Company','Clients and customer stories, Partners, About Srisun, Careers, and Contact Us.'),
 ('Resources','Learning and support destinations, including announcements, blog, knowledge base, Concierge, Shri, newsletter, and The Long Game.'),
 ('Careers flow','/careers/ → /careers/jobs/ → /careers/jobs/{role}/ → /careers/jobs/{role}/apply, with the current six roles.'),
 ('Contact','/contact-us/ with office details, map, contact methods and an enquiry destination to be confirmed before launch.')])
add_text('Routes above are proposed clean URLs. We will preserve existing URLs where practical and add redirects if any published URL needs to change. The final route list depends on the approved page inventory and actual Srisun service descriptions.')
add_text('Design and navigation')
add_text('Use the existing IBM Plex typography and a centered 1,240-pixel desktop container, with responsive gutters on smaller screens. Apply the four colors in the Srisun logo as accents across sections, menus, icons and links. Keep the header and footer shared across the site, make mega-menu headings visually distinct, and ensure keyboard and touch users can open every menu and page.')
add_text('SEO, GEO and AEO foundations')
bullet('Give every indexable route a unique title, meta description, canonical URL, social sharing metadata and one clear H1. Keep heading order meaningful and add descriptive alt text to informative images.')
bullet('Create and verify robots.txt and XML sitemap.xml, use clean internal links and breadcrumbs, and set redirects for any changed URLs. Avoid indexing duplicate or unfinished pages.')
bullet('Publish accurate company, service, industry, contact and location details. Use consistent NAP information (name, address and phone) and Organization, LocalBusiness or Service structured data only where the visible page supports it.')
bullet('Answer common customer questions directly on relevant pages using concise headings and FAQ content. Add FAQ structured data only when those same answers are visible to users; structured data does not guarantee rich results.')
bullet('For GEO and answer engines, write factual, attributable descriptions of Srisun services and locations, use descriptive page sections, and keep organization facts consistent. Review how these systems cite the business after launch; visibility is not guaranteed.')
bullet('Add analytics and search-console verification only after the owner supplies the property IDs and confirms consent and privacy requirements.')
page_break()

heading('Deployment Steps:')
add_text('We will implement the site in these stages. Content and access dependencies will be recorded as they are confirmed; the production deployment date depends on hosting access and review availability.')
add_image(steps_img)
add_caption('Implementation sequence; stages proceed after the listed inputs are available.')
for title, desc in [
 ('1. Confirm scope and content','Approve the sitemap, page priorities, service descriptions, company facts, testimonials, client-logo usage, contact details, social profiles and careers copy. Confirm the actual recipient or service behind each form.'),
 ('2. Build the shared design system','Set responsive layout rules, the 1,240-pixel desktop container, IBM Plex typography, four-color accents, buttons, cards, breadcrumb, menu behavior and shared footer.'),
 ('3. Implement pages and links','Build the home and page families, give each a direct URL, connect all mega-menu and footer links, add contextual links and preserve existing routes where practical.'),
 ('4. Add search and accessibility details','Write page metadata and semantic headings; add sitemap and robots rules, appropriate structured data, image alternatives, keyboard focus states and accessible form labels.'),
 ('5. Review and validate','Check every internal and external link, all routes, mobile and desktop layouts, browser navigation, form feedback, map and contact actions, page titles, canonical links, indexability and structured data.'),
 ('6. Stage and release','Confirm hosting, domain, HTTPS, deployment access, redirects, analytics and search-console properties. Review the staging site with the owner, publish, then verify key routes and keep a rollback copy of the previous release.'),
 ('7. Handoff and maintain','Deliver the source changes, page and link inventory, launch checklist and a follow-up document listing content, account access and maintenance tasks that remain with the site owner.')]:
    p=doc.add_paragraph(); p.paragraph_format.keep_together=True; p.paragraph_format.space_after=Pt(5)
    r=p.add_run(title+'  '); r.bold=True; r.font.color.rgb=RGBColor(22,119,210); p.add_run(desc)
add_text('Launch dependencies to confirm')
for x in ['Final service and industry copy, business facts, approved customer stories and logo permissions.','Production domain and hosting account, deployment method, DNS access and current-site backup.','Form destination or API, spam protection, privacy wording and data retention rules.','Analytics and Search Console ownership, IDs and consent expectations.','Final address, phone, email, business hours and social URLs; confirm the map pin matches the approved office address.']:
    bullet(x)
heading('Conclusion')
add_text('This plan uses the existing React and Vite project to deliver a connected Srisun website with complete page destinations, consistent design, working navigation, and search foundations for traditional search, generative search and direct-answer experiences. The Zoho reference guides page rhythm and navigation clarity; Srisun content, branding and verified facts determine the final experience.')
add_text('The work can begin with the route and content inventory, followed by shared components, page implementation, search details and release review. The later handoff document will list what has been completed and the remaining owner tasks after implementation. Hosting, form delivery, approved copy and account access remain dependencies until confirmed.')

# Preserve the template's section dimensions and avoid splitting small tables.
for table in doc.tables:
    for row in table.rows:
        trPr=row._tr.get_or_add_trPr(); cant=OxmlElement('w:cantSplit'); trPr.append(cant)
# Use compact footer-compatible metadata and save.
doc.core_properties.title='Srisun Full Website Redesign Plan'
doc.core_properties.subject='Implementation plan for a complete Srisun website with SEO, GEO and AEO foundations'
doc.core_properties.author='Srisun Website Project'
doc.save(OUT)
print(OUT)





