# MKU CU Connect

# Mount Kenya University Christian Union (MKU CU) Website - Comprehensive Development Prompt

## Project Overview
Create a modern, fast, responsive website for Mount Kenya University Christian Union (MKU CU) that serves as the central hub for spiritual growth, community engagement, and information dissemination for students.

## Theme & Tagline
**Main Theme:** "Living the Knowledge of God" (John 17:2-3)
**Tagline Options:**
- "Unity in Faith, Excellence in Service"
- "Equipping Students for Godly Impact"
- "Growing Together in Christ"

---

## Technical Requirements

### Performance & Responsiveness
- **Fast Loading:** Optimize all images (WebP format), lazy loading, minimal JavaScript
- **Mobile-First Design:** Fully responsive across all devices (320px to 4K displays)
- **Cross-Browser Compatible:** Chrome, Firefox, Safari, Edge
- **SEO Optimized:** Proper meta tags, structured data, sitemap
- **Progressive Web App (PWA):** Enable offline functionality for key content
- **Accessibility:** WCAG 2.1 AA compliance

### Design Aesthetic
- **Color Scheme:**
  - Primary: Deep Blue (#1e3a8a) or Royal Purple (#6b21a8) - representing faith and royalty in Christ
  - Secondary: Gold/Yellow (#fbbf24) - representing divine glory
  - Accent: Crimson Red (#dc2626) - representing Christ's sacrifice
  - Neutrals: White (#ffffff), Light Gray (#f3f4f6), Dark Gray (#1f2937)
  
- **Typography:**
  - Headings: Modern serif (Playfair Display, Crimson Text) or clean sans-serif (Inter, Plus Jakarta Sans)
  - Body: Readable sans-serif (Inter, Open Sans, Nunito)
  - Verse References: Elegant serif or script font
  
- **Visual Style:**
  - Clean, modern, professional yet warm and welcoming
  - Use of white space for clarity
  - Subtle animations and micro-interactions
  - Biblical imagery (light, cross, dove, open Bible) used tastefully
  - Photography: Authentic campus ministry photos, diverse student body

---

## Website Structure & Pages

### 1. HOME PAGE

#### Hero Section
- **Full-width hero slider** with 4-6 rotating slides (autoplay with manual controls):
  
  **Slide 1: Welcome**
  - Background: Campus worship scene or MKU CU gathering
  - Overlay: Semi-transparent dark overlay
  - Main Text: "Welcome to MKU Christian Union"
  - Subtext: "Living the Knowledge of God" - John 17:2-3
  - CTA Buttons: [Join MKU CU] [Attend This Sunday] [Watch Live]
  
  **Slide 2: Live Service Promotion**
  - Background: Worship team leading praise
  - Text: "Join Us Every Sunday"
  - Details: "7:00 AM - 12:45 PM | Auditorium (MKCC)"
  - CTA: [View This Week's Theme] [Add to Calendar]
  
  **Slide 3: Current Mission/Major Event**
  - Background: Mission trip or major event photo
  - Text: "Limuru Sub-Mission 2025"
  - Subtext: "Restored by His Mercy" - 1 Peter 1:3
  - Dates: October 17-19
  - CTA: [Learn More] [Support This Mission]
  
  **Slide 4: YouTube Channel**
  - Background: Video production/recording scene
  - Text: "Never Miss a Message"
  - Subtext: "Watch sermons, testimonies & more on YouTube"
  - CTA: [Visit Our Channel] [Watch Latest Sermon]
  
  **Slide 5: Join Community**
  - Background: Happy fellowship gathering
  - Text: "Become Part of Our Family"
  - Subtext: "Join 500+ students growing in faith"
  - CTA: [Join WhatsApp Community] [Register Now]

- **Hero Design Elements:**
  - Ken Burns effect (slow zoom on images)
  - Smooth fade transitions (5 seconds per slide)
  - Navigation dots at bottom
  - Left/right arrow controls
  - Pause on hover
  - Mobile-optimized (vertical layout, larger text)
  - Animated scroll-down indicator (bounce arrow)

#### Live Service Status Banner (Conditional)
- **When service is LIVE:**
  - Sticky banner at very top of page
  - Red pulsing background
  - Text: "🔴 SUNDAY SERVICE IS LIVE NOW!"
  - CTA: [WATCH LIVE] button
  - Time indicator: "Started 35 minutes ago"
  - Dismiss option (X), but reappears on page refresh

#### Quick Stats Counter (Animated on scroll)
- **Four stat cards in a row:**
  ```
  ┌─────────────┬─────────────┬─────────────┬─────────────┐
  │    500+     │     46      │     20+     │    1000+    │
  │   Members   │ Years Active│   Schools   │  Salvations │
  │             │             │   Reached   │             │
  └─────────────┴─────────────┴─────────────┴─────────────┘
  ```
- Counter animation (numbers count up on first view)
- Icon above each number
- Mobile: 2x2 grid

#### "This Week at MKU CU" Section (PRIORITY)
- **Large section header:** "Happening This Week"
- Week date range: "November 23 - 29, 2025"
- **Carousel/Grid of daily events:**
  - Show 3-4 cards at a time on desktop
  - Swipeable on mobile
  - Each card shows:
    - Day & date (large)
    - Event icon
    - Event title
    - Time & venue
    - "View Details" link
  - Color-coded by event type
  - "See Full Week Schedule" button → Links to Events page

#### Live/Latest YouTube Section
- **Section Header:** "Latest from MKU CU" or "Watch & Be Blessed"
- **YouTube Integration:**
  
  **If Currently Live:**
  - Embedded YouTube live player (large, featured)
  - "🔴 LIVE NOW" badge
  - Service details beside/below player
  - Live viewer count
  - [Share Live Stream] button
  
  **If Not Live:**
  - Latest 3 sermon videos in a row (thumbnail grid)
  - Each shows: Thumbnail, title, duration, upload date
  - Play icon overlay
  - Click → Opens video modal or YouTube
  - "View All Sermons" button → Media page

- **YouTube Channel Promotion:**
  - Small section: "Subscribe to our YouTube Channel"
  - Subscriber count (if available via API)
  - [Subscribe] button (red, YouTube branding)
  - Channel description: "Watch weekly sermons, testimonies, and event highlights"

#### Vision & Mission Section
- Side-by-side cards or alternating layout
- **Vision:** "Living as True Disciples of Jesus Christ"
- **Mission:** "Nurturing belief in Christ & Developing Christ-like character"
- **Core Values:** Displayed as icon cards
  - Discipleship
  - Evangelism
  - Mission
  - Leadership Development
  - Fellowship
  - Integrity
  - Unity

#### Weekly Schedule Overview
- **Interactive calendar widget** or card-based layout:
  - Sunday Service (Time, Venue, Host/Speaker)
  - Midweek Service (Wednesday, 4-6 PM, CT Hall)
  - Discovery Bible Study (Thursday, 4-6 PM, MLT Hall A)
  - Foundation Classes (Sunday, 4-6 PM, MLT Hall B)
  - Debate Sessions (Wednesday, 6:30-8:30 PM, CC Hall)
  - Midnight Prayers (Wednesday, 11 PM-5 AM, CT Hall)
  - Home Fellowships (Various times)

#### Upcoming Events Section
- **Event cards** with:
  - Event poster/image
  - Title, date, time, venue
  - Theme & theme verse
  - "Learn More" or "Register" buttons
- Filter by: All Events, Missions, Conferences, Socials, Outreach

#### Recent Testimonies/Blog
- **Featured testimony cards** (3-4 latest)
- Excerpt, "Read More" link
- Filterable by category: Testimony, Teaching, Mission Reports

#### Leadership Snapshot
- Photos and names of current Executive Committee
- "Meet Our Full Team" link

#### Quick Links Section
- Join MKU CU
- Prayer Request
- Give/Donate
- Contact Us
- Resource Library

#### Footer
- Social media links (WhatsApp, Facebook, Instagram, YouTube, Twitter/X)
- Contact information
- Quick navigation
- Newsletter signup
- Copyright & credits

---

### 2. ABOUT PAGE

#### Our History
- **Timeline component** showing MKU CU's journey
- Foundation year, key milestones, growth story
- Connection to FOCUS Kenya

#### Vision, Mission & Core Values
- Expanded detailed sections
- **Doctrinal Basis:**
  - The Trinity
  - Inspiration of Scripture
  - Salvation through Christ alone
  - The Church
  - Second Coming
  - (Full doctrinal statement from MCCU model)

#### Our Aims (Expandable Accordions)
1. **Discipleship** - Deepen spiritual life through Bible study, prayer, fellowship
2. **Evangelism** - Witness to Jesus, lead others to faith
3. **Mission** - Sensitize members into mission work
4. **Leadership Development** - Holistic growth and leadership training

#### Affiliations
- FOCUS Kenya logo and description
- Links to partner churches/organizations

#### Departmental Structure
- **8 Main Committees** with sub-ministries:

**1. Worship Committee**
- Choir
- Praise & Worship Team
- Ushers
- Technicians/Media
- Decorations

**2. Missions Committee**
- High School Ministry
- Sunday School Ministry
- Children's Ministry
- Hospital Ministry
- Prison Ministry

**3. Evangelism Committee**
- International Students Outreach
- Advocacy Team
- Evangelistic Teams
- School-Based Fellowships

**4. Information & Communication**
- IT & Research
- Publicity Team
- Editorial/Content
- Library
- Media Production

**5. Social Welfare Ministry**
- Care Unit
- Counseling Services
- Special Abilities Support
- Hospitality & Catering

**6. Creative Ministry**
- Creative Arts (Music, Fine Arts, Drama, Dance)
- Sports Ministry

**7. Discipleship Committee**
- Bible Study Coordination
- Nurture Classes
- Daughters of Zion (Ladies Ministry)
- Men of Valor (Men's Ministry)
- BEST-P (Bible Exposition Self Training)

**8. Intercessory Committee**
- Prayer Coordination
- Prayer Chain
- Midnight Prayers

#### Join MKU CU
- **Membership form/button**
- Benefits of membership
- What to expect

---

### 3. LEADERSHIP PAGE

#### Executive Committee (Current Year)
- **Card grid layout** with photos:
  - Chairperson
  - Vice Chairpersons (1st & 2nd)
  - Secretary
  - Vice Secretary
  - Treasurer
  - Committee Heads (Literature, BS & Training, CREAM, Prayer, Evangelism, ASAP, Missions, Sunday Service, Discipleship)

#### Each Leader Card Shows:
- Professional photo
- Name
- Position
- Ministry year (e.g., 2024-2025)
- Brief bio/ministry focus (optional)
- Contact button (opens form, not direct email)

#### Patrons & Advisors
- University Chaplain
- Patron
- Advisory Board Members

#### Past Leadership Archive
- **Searchable archive** by year
- Dropdown selector: 2024-2025, 2023-2024, etc.
- Alumni leaders who became notable ministers/professionals

---

### 4. EVENTS PAGE

#### This Week View (Featured at Top)
- **Large, prominent section:** "HAPPENING THIS WEEK"
- Week date range displayed: "Nov 23 - Nov 29, 2025"
- **Format: Interactive Timeline Cards**

```
╔════════════════════════════════════════╗
║  SUNDAY, NOV 23                       ║
╠════════════════════════════════════════╣
║  🙏 SUNDAY SERVICE                     ║
║  7:00 AM - 12:45 PM                   ║
║  📍 Auditorium (MKCC)                 ║
║  🎤 Host: Pst. Dennis Mutwiri         ║
║  📖 Theme: Living the Knowledge of God║
║     (John 17:2-3)                     ║
║  [Watch Live] [View Details] [Add to Cal]║
╚════════════════════════════════════════╝

╔════════════════════════════════════════╗
║  SUNDAY, NOV 23                       ║
╠════════════════════════════════════════╣
║  📚 FOUNDATION CLASSES                 ║
║  4:00 PM - 6:00 PM                    ║
║  📍 MLT Hall B                        ║
║  For new believers & those seeking     ║
║  to strengthen their faith foundation  ║
║  [View Details] [Add to Cal]          ║
╚════════════════════════════════════════╝

╔════════════════════════════════════════╗
║  WEDNESDAY, NOV 26                    ║
╠════════════════════════════════════════╣
║  🎤 MIDWEEK SERVICE                    ║
║  4:00 PM - 6:00 PM                    ║
║  📍 CT Hall                           ║
║  [View Details] [Add to Cal]          ║
║                                        ║
║  💭 DEBATE SESSION                     ║
║  6:30 PM - 8:30 PM                    ║
║  📍 CC Hall                           ║
║  Topic: "Should Christians use         ║
║  psychology & therapy or solely rely   ║
║  on prayer and Scripture?"            ║
║  [View Details] [Add to Cal]          ║
║                                        ║
║  🌙 MIDNIGHT PRAYERS                   ║
║  11:00 PM - 5:00 AM                   ║
║  📍 CT Hall                           ║
║  Theme: "Strengthened in the might     ║
║  of the Spirit" - Ephesians 3:16      ║
║  [View Details] [Add to Cal]          ║
╚════════════════════════════════════════╝

╔════════════════════════════════════════╗
║  THURSDAY, NOV 27                     ║
╠════════════════════════════════════════╣
║  📖 DISCOVERY BIBLE STUDY              ║
║  4:00 PM - 6:00 PM                    ║
║  📍 MLT Hall A                        ║
║  Dive deeper into God's Word in        ║
║  interactive study sessions            ║
║  [View Details] [Add to Cal]          ║
║                                        ║
║  🏠 JOINT HOME FELLOWSHIP              ║
║  6:00 PM - 8:30 PM                    ║
║  📍 CC Hall                           ║
║  Theme: "Honouring God"                ║
║  (1 Corinthians 6:20)                 ║
║  [View Details] [Add to Cal]          ║
╚════════════════════════════════════════╝

╔════════════════════════════════════════╗
║  SATURDAY, NOV 29                     ║
╠════════════════════════════════════════╣
║  👩 LADIES FORUM                       ║
║  8:00 AM - 1:30 PM                    ║
║  📍 MLT Hall A                        ║
║  🎤 Guest: Mum Naomi Njeri            ║
║  Host: Mum Lorine Atieno              ║
║  Theme: "Glow in Holiness" (Ruth 3:11)║
║  👗 Dress Code: Red & White           ║
║  [Register Now] [Add to Cal]          ║
╚════════════════════════════════════════╝
```

- **Visual design features:**
  - Color-coded left border by event type
  - Icons for quick recognition
  - Hover animation (card lifts slightly)
  - Mobile-optimized (stack vertically, swipe between days)
  - "View Full Week" expandable
  - "Next Week" preview button

#### Full Events Calendar
- **Interactive calendar plugin** (FullCalendar.js style)
- **View Modes:**
  - 📅 Month View (default)
  - 📊 Week View
  - 📋 Day View
  - 📝 List View (agenda style)
  
- **Calendar Features:**
  - Click any date to see all events
  - Color-coded events:
    - 🔵 Blue: Sunday Worship
    - 🟢 Green: Bible Study & Discipleship
    - 🟡 Gold: Fellowship & Social
    - 🔴 Red: Prayer Meetings
    - 🟣 Purple: Special Events (Conferences, Missions)
    - 🟠 Orange: Leadership/Training
  - Today's date highlighted
  - Navigation arrows (previous/next month)
  - "Today" quick jump button
  - Event count badge on dates

#### Event Details Modal/Page
- Click event → Opens detailed view:
  - **Large event poster/banner image**
  - Event title (large, bold)
  - Date & time (with countdown if upcoming)
  - Venue with Google Maps embed/link
  - Theme & theme verse (if applicable)
  - Host/Speaker information with photo
  - Full description
  - Event schedule/program outline
  - Dress code (if specified)
  - What to bring
  - Registration status (Open/Closed/Full)
  - **Action Buttons:**
    - [Register for Event] (if required)
    - [Add to Google Calendar]
    - [Add to Outlook]
    - [Add to Apple Calendar]
    - [Download iCal]
    - [Share Event] (WhatsApp, Facebook, Twitter, Copy Link)
    - [Get Directions]
  - Related/Similar events suggestions

#### Upcoming Events (List View)
- **Filterable by category:**
  - All Events
  - Weekly Services
  - Missions & Outreach
  - Conferences & Camps
  - Fellowship & Socials
  - Leadership Training
  - Special Meetings
  
- **Sort options:**
  - Soonest first (default)
  - By category
  - By venue

- **Event Card Components:**
  - Event thumbnail
  - Date badge (large, stylized)
  - Title
  - Time & venue
  - Brief description
  - "Learn More" button
  - Quick "Add to Calendar" icon button

#### Special Events Highlight
- **Featured/Pinned Events Section:**
  - Major upcoming events (Missions, Annual Conference)
  - Large banner-style cards
  - Countdown timer
  - Registration progress bar (e.g., "45/100 spots filled")
  - Early bird registration deadlines

#### Past Events Archive
- **Filter by year/semester:**
  - 2025/2026 Academic Year
  - 2024/2025 Academic Year
  - etc.
  
- **Each past event shows:**
  - Event summary
  - Photo gallery link
  - Video recording (if available)
  - Testimonies from attendees
  - Impact report (for missions)

#### Events Notifications
- **Email reminder system:**
  - 1 week before event
  - 1 day before event
  - 1 hour before event (for registered users)
  
- **Push notifications** (if PWA enabled):
  - Event starting soon
  - Event location changed
  - Event cancelled/postponed

---

### 5. MEDIA PAGE

#### YouTube Channel Showcase
- **Channel header section:**
  - Embedded YouTube channel art/banner
  - Channel logo
  - Subscribe button (live subscriber count if possible)
  - "Watch our latest content" CTA
  - Channel description
  - **Link:** youtube.com/@mkucu (update with actual channel)

#### Video Categories/Playlists
- **Tab navigation** or **card grid:**
  
  **📺 Latest Uploads** (Default view)
  - Grid of latest 12 videos from channel
  - Auto-updates when new videos uploaded
  - Infinite scroll or "Load More" button
  
  **🙏 Sunday Services**
  - All Sunday service recordings
  - Filter by date, speaker, theme
  - Sermon series grouping
  
  **📖 Midweek Services**
  - Wednesday service teachings
  - Bible study recordings
  
  **🌍 Mission Reports**
  - Mission trip documentaries
  - Testimonies from the field
  - Mission preparation teachings
  
  **🎉 Conferences & Special Events**
  - Annual conferences
  - Leadership camps
  - Guest speakers
  - Special celebrations
  
  **💬 Testimonies**
  - Student testimonies
  - Salvation stories
  - Answered prayers
  
  **🎵 Worship & Music**
  - Choir performances
  - Praise & worship sessions
  - Music videos

#### Video Card Design (for each video)
- Thumbnail (YouTube generated)
- Video title (truncated if too long)
- Upload date ("2 days ago" format)
- Duration badge (bottom right of thumbnail)
- View count
- Play icon overlay
- On hover: Shows description preview
- Click → Opens video in:
  - Lightbox modal with embedded YouTube player, OR
  - Redirects to YouTube (user choice in settings)

#### Live Streaming Section (Prominent)
- **When Live:**
  - Large banner: "🔴 WE'RE LIVE NOW - Join the Service!"
  - Full-width embedded YouTube live player
  - Live chat sidebar (YouTube chat embedded)
  - Current service info:
    - Service type (Sunday Service, Midweek, Special Event)
    - Theme & verse
    - Host/Speaker
    - Time started
    - Expected end time
  - "Share Live Stream" buttons
  
- **When Not Live:**
  - Countdown to next live service
  - "Set a Reminder" button
  - Previous livestream replay (most recent)
  - Weekly live schedule:
    ```
    📅 LIVE SERVICE SCHEDULE
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🌅 SUNDAY MORNING SERVICE
    First Service: 7:00 - 9:00 AM
    Second Service: 9:00 - 11:00 AM
    Third Service: 11:00 AM - 12:45 PM
    
    📖 WEDNESDAY MIDWEEK SERVICE
    4:00 - 6:00 PM
    
    🎤 SPECIAL EVENTS (As announced)
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    All times are EAT (East Africa Time)
    ```
  - "Subscribe to get notifications" → YouTube subscribe
  - "Add to Calendar" button

#### Sermon Library (Searchable)
- **Search bar** with filters:
  - By speaker/preacher
  - By date range
  - By book of the Bible
  - By topic/theme
  - By sermon series
- **Sort options:**
  - Most recent
  - Most viewed
  - Longest
  - Shortest

#### Audio-Only Sermons (If available)
- For users with limited data
- Downloadable MP3 files
- Embedded audio player
- "Listen while browsing" sticky mini-player

#### Photo Gallery
- **Organized albums:**
  - Sunday Services
  - Missions (by location/year)
  - Conferences
  - Socials & Fellowship
  - Leadership
- Lightbox viewing experience
- Download options

#### Testimonies
- Written testimonies
- Video testimonies
- Audio testimonies
- Submit your testimony (form)

#### Live Streaming
- **Live embed** for Sunday services and special events
- "Join Live Service" prominent button when active
- Past livestreams archive

---

### 6. RESOURCES PAGE

#### Bible Study Materials
- Study guides (PDF downloads)
- Discussion questions
- Topical studies
- Book studies

#### Devotionals
- Daily/weekly devotionals
- Subscribe to receive via email

#### Reading Plans
- Curated Bible reading plans
- Track progress (requires login)

#### Downloads
- MKU CU Constitution
- Membership forms
- Event posters and flyers
- Doctrinal statements

#### Sermon Notes
- Downloadable sermon outlines
- Fill-in-the-blank study guides

#### Holy Bible
- **Embedded Bible reader** (Bible Gateway or YouVersion API)
- Multiple translations
- Search functionality

#### Songs & Lyrics
- Worship songs library
- Lyrics with chords
- Audio/video links

#### Recommended Resources
- Books
- Podcasts
- Websites
- Apps

---

### 7. BLOG PAGE

#### Categories
- Teaching & Discipleship
- Mission Reports
- Testimonies
- Campus Life & Faith
- Events Recaps
- Leadership Insights
- Prayer & Fasting

#### Blog Features
- **Featured post** at top
- Grid layout for posts
- Search & filter by category, date, author
- Related posts
- Social sharing buttons
- Comments section (moderated)
- RSS feed

#### Each Post Includes:
- Featured image
- Title, date, author
- Excerpt
- Read time estimate
- Tags

---

### 8. PRAYER PAGE

#### Submit Prayer Request
- **Anonymous or named** option
- Categories: Personal, Academic, Health, Family, Spiritual, Ministry
- Form fields: Name (optional), Email (optional), Request, Category, Privacy (public/private)
- Success message after submission

#### Prayer Wall
- Display public prayer requests
- Members can click "Praying for You" button (count displayed)
- Testimony follow-up option

#### Prayer Resources
- How to pray guide
- Prayer topics for the week
- Scripture prayers
- Prayer chains signup

#### Prayer Schedule
- Midnight prayers schedule
- Corporate prayer meetings
- Fasting days

---

### 9. GIVING/DONATE PAGE

#### Why Give
- Support missions
- Events and conferences
- Resource materials
- Welfare ministry
- Leadership training

#### How to Give
- **M-Pesa Paybill/Till Number** (large, prominent)
- Bank account details
- Online giving platform integration (if available)
- Offering during services

#### Giving Options
- One-time donation
- Monthly partnership
- Project-specific giving (missions, bursaries, etc.)

#### Transparency
- How funds are used
- Accountability statement

#### Testimonies
- Impact stories from giving

---

### 10. CONTACT PAGE

#### Contact Form
- Name, Email, Phone, Subject, Message
- Department dropdown (General, Leadership, Missions, Media, Prayer, etc.)
- "Send Message" button

#### Contact Information
- **Physical Address:** MKU Thika Campus (specific location)
- **Email:** mkucu@example.com (update with actual)
- **Phone/WhatsApp:** +254 704 021286
- **Social Media Links:** WhatsApp Community, Facebook, Instagram, YouTube, X/Twitter

#### Office Hours
- When leadership is available
- Where to find us on campus

#### FAQ Section
- Common questions answered
- "How to join," "Service times," "Getting involved," etc.

#### Embedded Google Map
- MKU Campus location pin

---

## Header & Navigation Design

### Desktop Header
- **Top Bar (Optional - Thin stripe):**
  - Contact: +254 704 021286
  - Email: mkucu@mku.ac.ke
  - Social media icons (right aligned)
  - "Join Us" button (right corner)

- **Main Header:**
  - **Logo (Left):** MKU CU logo with "Living the Knowledge of God" tagline underneath
  - **Navigation Menu (Center/Right):** 
    - Home | About | Events | Media | Resources | Blog | Prayer | Give | Contact
  - **Action Buttons (Far Right):**
    - "Watch Live" (red badge when live)
    - "Join WhatsApp Community"
  - **Sticky header** on scroll (compressed version)

### Mobile Header & Menu
- **Mobile Header:**
  - Logo (left, smaller)
  - Hamburger menu icon (right)
  - "Live" badge indicator (if service is live)
  
- **Mobile Menu (Slide-in from right):**
  - **Header of menu:**
    - Close button (X)
    - MKU CU logo
    - Theme: "Living the Knowledge of God"
  
  - **Menu Items (Large, touch-friendly):**
    - 🏠 Home
    - ℹ️ About (expandable submenu with + icon)
      - Our History
      - Vision & Mission
      - Leadership
      - Departments
      - Join MKU CU
    - 📅 Events (expandable)
      - This Week
      - Calendar
      - Upcoming Events
      - Past Events
    - 🎥 Media (expandable)
      - YouTube Channel
      - Watch Live
      - Sermons Library
      - Photo Gallery
      - Testimonies
    - 📚 Resources (expandable)
      - Bible Study Materials
      - Devotionals
      - Downloads
      - Online Bible
    - ✍️ Blog
    - 🙏 Prayer (expandable)
      - Submit Request
      - Prayer Wall
      - Prayer Resources
    - 💝 Give
    - 📞 Contact
  
  - **Quick Action Buttons (Bottom of menu):**
    - Large, colorful buttons:
    - 📱 Call Us
    - 💬 WhatsApp Community
    - 📧 Email Us
    - 🔴 Watch Live (if active)
  
  - **Footer of Menu:**
    - Social media icons
    - "Join MKU CU Today" CTA button

## Special Features & Functionality

### 1. YouTube Integration (CRITICAL)

#### YouTube Channel Section (Homepage & Media Page)
- **Channel Header:**
  - Embedded YouTube channel banner
  - "Subscribe" button with subscriber count
  - Channel description
  - **Channel Link:** [Your YouTube Channel URL - e.g., youtube.com/@mkucu]

#### Latest Sermons/Videos Section
- **Automated feed** pulling latest 6-8 videos from YouTube channel
- **Video Cards Display:**
  - Thumbnail image
  - Video title
  - Upload date
  - Duration
  - View count
  - Play icon overlay
- Click to watch in lightbox modal or redirect to YouTube
- "View All Videos" button → Links to full Media page
- **Playlist Categories:**
  - Sunday Services
  - Midweek Services
  - Conferences & Seminars
  - Mission Trip Reports
  - Testimonies
  - Bible Study Series
  - Leadership Teachings

#### Individual Video Pages (Optional)
- Embedded YouTube player
- Video title, description
- Related videos sidebar
- Share buttons
- Download sermon notes (if available)

### 2. Live Streaming Feature (PROMINENT)

#### Live Service Indicator
- **When Live:**
  - Red "🔴 LIVE NOW" badge in header (pulsing animation)
  - Banner across top of homepage: "Sunday Service is Live! Join Now →"
  - Prominent "Watch Live Service" button (large, center of hero section)
  - Countdown timer before service starts (e.g., "Live in 2:15:30")

#### Live Stream Page/Section
- **Full-width YouTube live embed** (when active)
  - Chat sidebar (YouTube live chat embedded)
  - Service information displayed:
    - Theme & theme verse
    - Speaker/Host
    - Service schedule (e.g., "First Service: 7:00-9:00 AM")
    - Order of service (optional)
  
- **When Not Live:**
  - "Next Live Service" countdown
  - Previous service replay
  - Weekly service schedule
  - "Set Reminder" button (adds to calendar)

#### Live Service Schedule Display
- **Visual calendar showing:**
  - Sunday Services: 7:00 AM - 12:45 PM
  - Special Events Live (Conferences, Missions Reports, etc.)
  - Time zone indicator
  - "Remind Me" functionality (email/browser notification)

### 3. Events Calendar & "This Week" Section

#### "Happening This Week" Component (Homepage Priority)
- **Modern card-based layout or timeline format**
- **Header:** "This Week at MKU CU" with week dates (e.g., "Nov 23 - Nov 29")
- **Daily Breakdown:**

**Format Option 1: Timeline Style**
```
┌─────────────────────────────────────┐
│ SUNDAY, NOV 23                      │
│ ───────────────────────────────────│
│ 🙏 Sunday Service                   │
│ 7:00 AM - 12:45 PM | Auditorium    │
│ Theme: Living the Knowledge of God  │
│ Host: Pst. Dennis Mutwiri          │
│ [View Details]                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ MONDAY, NOV 24                      │
│ ───────────────────────────────────│
│ 📖 Foundation Classes               │
│ 4:00 PM - 6:00 PM | MLT Hall B     │
│ [View Details]                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ WEDNESDAY, NOV 26                   │
│ ───────────────────────────────────│
│ 🎤 Midweek Service                  │
│ 4:00 PM - 6:00 PM | CT Hall        │
│ [View Details]                      │
│                                     │
│ 💬 Debate Session                   │
│ 6:30 PM - 8:30 PM | CC Hall        │
│ Topic: Should Christians use        │
│ psychology or solely rely on prayer?│
│ [View Details]                      │
│                                     │
│ 🌙 Midnight Prayers                 │
│ 11:00 PM - 5:00 AM | CT Hall       │
│ [View Details]                      │
└─────────────────────────────────────┘
```

**Format Option 2: Grid Cards**
- Each day is a card
- Icon representing event type
- Time and venue prominently displayed
- Hover effect reveals more details
- Color-coded by event type:
  - 🔵 Sunday/Worship: Blue
  - 🟢 Bible Study: Green
  - 🟡 Fellowship: Yellow/Gold
  - 🔴 Prayer: Red
  - 🟣 Special Events: Purple

#### Full Events Calendar (Events Page)
- **Interactive calendar plugin** (FullCalendar.js or similar)
- **Views:** Month, Week, Day, List
- **Color-coded events**
- **Click event for details popup:**
  - Event poster/image
  - Title & theme
  - Date, time, duration
  - Venue (with map link)
  - Description
  - Speaker/Host
  - Registration button (if needed)
  - Add to Calendar (Google, Outlook, Apple)
  - Share event

#### Event Registration Integration
- "Register for Event" button
- Form fields:
  - Name
  - Email
  - Phone
  - Student ID (optional)
  - Year of Study
  - Home Fellowship Group (dropdown)
  - Special requests/questions
- Email confirmation after registration
- QR code for event check-in (optional)

### 4. Join MKU CU - Multiple Entry Points

#### "Join Us" Call-to-Action (Throughout Site)
- **Homepage hero section:** "Join MKU CU Family Today" button
- **Floating button** (bottom right corner): "Become a Member"
- **Footer:** "Ready to Grow in Faith? Join Us!"
- **After blog posts/testimonies:** "Inspired? Join MKU CU"

#### Comprehensive Join/Membership Page
- **Welcome video** from Chairperson or Patron
- **Benefits of Membership:**
  - Spiritual growth through discipleship
  - Community and fellowship
  - Leadership opportunities
  - Mission experiences
  - Personal mentorship
  - Access to resources
  - Eternal impact

- **Membership Form (Detailed):**
  - **Personal Information:**
    - Full Name *
    - Email Address *
    - Phone Number (WhatsApp) *
    - Student ID Number *
    - Course/Program *
    - Year of Study *
    - Expected Graduation Year
  
  - **Spiritual Background:**
    - Are you born again? (Yes/No)
    - Share your salvation testimony (textarea)
    - Home church/denomination
    - Have you been baptized? (Yes/No)
    - Water baptism date (if applicable)
  
  - **Involvement Preferences:**
    - Which ministries interest you? (checkboxes):
      ☐ Worship (Choir, P&W, Ushering, Tech)
      ☐ Missions & Evangelism
      ☐ Creative Arts (Drama, Dance, Fine Arts)
      ☐ Media & Communications
      ☐ Intercessory Prayer
      ☐ Bible Study & Discipleship
      ☐ Social Welfare
      ☐ Sports Ministry
      ☐ Hospitality
    
    - Preferred Home Fellowship Group:
      - Dropdown: Kiganjo/Kiang'ombe, Runda, Biafra, Mukiriti/Zwni, Starehe, School Area, Other
  
  - **Agreement:**
    - ☐ I have read and agree to the MKU CU Constitution
    - ☐ I subscribe to the Doctrinal Basis of Faith
    - ☐ I commit to attend regularly and participate actively
  
  - **Submit Button:** "Join MKU CU Family"
  - **Confirmation:** "Welcome to MKU CU! Check your email for next steps."

#### Post-Registration Flow
- **Automated welcome email** with:
  - Welcome message
  - Link to MKU CU WhatsApp Community groups
  - This Sunday's service details
  - Nurture class information (for new believers)
  - Link to member resources
  - Contact person for new members

#### WhatsApp Community Groups Display
- **Interactive list showing all groups:**
  
  **Main Community Groups:**
  - 📱 MKUCU 2025/2026 REGISTRATION (158 members) - [Join]
  - 👫 MKUCU SEP-DEC INTAKE 25/26 - [Join]
  - 👨 MKUCU GENTS 2025/2026 - [Join]
  - 👩 MKUCU LADIES 2025/2026 - [Join]
  
  **Home Fellowship Groups:**
  - 🏠 Kiganjo/Kiang'ombe Home Fellowship 25/26 - [Join]
  - 🏠 Runda Home Fellowship 25/26 - [Join]
  - 🏠 Biafra Home Fellowship 25/26 (95 members) - [Join]
  - 🏠 Mukiriti/Zwni/Town Home Fellowship (197 members) - [Join]
  - 🏠 Starehe Home Fellowship 25/26 - [Join]
  - 🏠 School Area Home Fellowship - [Join]
  
  **Ministry-Specific Groups:**
  - 🎵 MKUCU Choir 25/26 - [Join]
  - 🎤 Ushering Family MKUCU (158 members) - [Join]
  - 🎨 Creative Ministers Family 25/26 (119 members) - [Join]
  - 🎬 MKUCU Multimedia Ministry 25/26 - [Join]
  - 🔊 MKUCU Sound Ministry 25/26 - [Join]
  - 💝 Care Ministry 25/26 - [Join]
  - 📖 Bible Study Ministry 25/26 - [Join]
  - 🌍 Missions & Evangelism 25/26 - [Join]
  - 🙏 MKU CU Intercessory Ministry - [Join]
  - 💬 Ladies and Gents Ministries - [Join]
  - 🌟 MKUCU IGM 25/26 (100 members) - [Join]
  - 📆 MKUCU MAY-AUG 2025 INTAKE - [Join]
  - 🎓 MKUCU PW 25/26 - [Join]

- Each group shows:
  - Group name
  - Member count (if public)
  - Brief description
  - "Request to Join" or "Join" button → Opens WhatsApp

### 5. Member Dashboard (Optional - Phase 2)
- Login/signup functionality
- Personal profile
- Track attendance
- Access member-only resources
- Prayer request history
- Giving history
- Certificate downloads (for completed courses/camps)

## Additional Critical Features

### Footer Design (Comprehensive)

#### Footer Structure (Multi-Column Layout)

**Column 1: About MKU CU**
- MKU CU logo
- Tagline: "Living the Knowledge of God"
- Brief mission statement (2-3 sentences)
- Affiliated with FOCUS Kenya badge/logo

**Column 2: Quick Links**
- About Us
- Events Calendar
- Media & Sermons
- Prayer Requests
- Give/Donate
- Contact Us
- Join MKU CU

**Column 3: Connect With Us**
- 📱 WhatsApp Community Groups
- 📧 Email: mkucu@mku.ac.ke
- ☎️ Phone: +254 704 021286
- 📍 Location: MKU Thika Campus
- Social Media Icons (large, colorful):
  - Facebook
  - Instagram
  - YouTube
  - Twitter/X
  - TikTok (if applicable)

**Column 4: Weekly Services**
- Sunday Service: 7:00 AM - 12:45 PM
- Midweek Service: Wed 4:00 - 6:00 PM
- Discovery Bible Study: Thu 4:00 - 6:00 PM
- Foundation Classes: Sun 4:00 - 6:00 PM
- [View Full Schedule →]

**Column 5: Newsletter Signup**
- "Stay Updated" heading
- Brief description: "Get weekly devotionals, event updates & prayer points"
- Email input field
- [Subscribe] button
- Privacy note: "We respect your privacy"

**Footer Bottom Bar:**
- Left: © 2025 Mount Kenya University Christian Union. All rights reserved.
- Center: Living the Knowledge of God - John 17:2-3
- Right: 
  - Privacy Policy | Terms of Service
  - "Design by [Your Name/Team]" credit link

### Mobile Menu (Detailed Design)

#### Mobile Menu Behavior
- **Trigger:** Hamburger icon (☰) top right of mobile header
- **Animation:** Slides in from right with smooth easing
- **Background:** Overlay darkens rest of page (clickable to close)
- **Width:** 85% of screen width (max 320px)
- **Height:** Full viewport height
- **Scroll:** Menu content scrollable if items exceed screen height

#### Mobile Menu Layout
```
┌─────────────────────────────────┐
│ ✕                    [MKU CU]   │ ← Close button & Logo
│─────────────────────────────────│
│ Living the Knowledge of God     │ ← Theme verse
│─────────────────────────────────│
│                                 │
│ 🏠 Home                          │
│                                 │
│ ℹ️ About                    [+]  │ ← Expandable
│   → Our History                 │ ← Sub-items (when expanded)
│   → Vision & Mission            │
│   → Leadership                  │
│   → Departments                 │
│   → Join MKU CU                 │
│                                 │
│ 📅 Events                   [+]  │
│   → This Week                   │
│   → Calendar View               │
│   → Upcoming Events             │
│   → Past Events                 │
│                                 │
│ 🎥 Media                    [+]  │
│   → YouTube Channel             │
│   → Watch Live                  │
│   → Sermons Library             │
│   → Photo Gallery               │
│   → Testimonies                 │
│                                 │
│ 📚 Resources                [+]  │
│   → Bible Study Materials       │
│   → Devotionals                 │
│   → Downloads                   │
│   → Online Bible                │
│                                 │
│ ✍️ Blog                          │
│                                 │
│ 🙏 Prayer                   [+]  │
│   → Submit Request              │
│   → Prayer Wall                 │
│   → Prayer Resources            │
│                                 │
│ 💝 Give                          │
│                                 │
│ 📞 Contact                       │
│                                 │
│─────────────────────────────────│
│ ┌──────────────┬──────────────┐ │ ← Quick Action Buttons
│ │ 📱 Call Us   │ 💬 WhatsApp  │ │
│ └──────────────┴──────────────┘ │
│ ┌──────────────┬──────────────┐ │
│ │ 📧 Email     │ 🔴 Watch Live│ │
│ └──────────────┴──────────────┘ │
│─────────────────────────────────│
│ [🔵] [📷] [▶️] [🐦] [📱]        │ ← Social Icons
│                                 │
│ ┌─────────────────────────────┐ │
│ │   JOIN MKU CU TODAY  →      │ │ ← Primary CTA
│ └─────────────────────────────┘ │
│                                 │
│ © 2025 MKU CU                   │
└─────────────────────────────────┘
```

#### Mobile Menu Features:
- **Smooth animations:**
  - Menu slides in from right (300ms ease-out)
  - Submenu items slide down when parent clicked (200ms)
  - Hover/active states with color change
  
- **Touch-friendly:**
  - Large tap targets (minimum 48x48px)
  - Adequate spacing between items
  - Visible active/pressed states
  
- **Smart behavior:**
  - Remembers expanded state of submenus during session
  - Auto-closes when navigating to a page
  - Swipe right to close
  - Tapping overlay closes menu
  
- **Accessibility:**
  - Focus trap (tab navigation stays within menu)
  - Escape key closes menu
  - ARIA labels for screen readers
  - High contrast mode support

### Header Variations

#### Desktop Header (Detailed)
```
┌────────────────────────────────────────────────────────────────┐
│ Top Bar (Optional - Thin strip, colored background)           │
│ ☎ +254 704 021286 | ✉ mkucu@mku.ac.ke     [FB][IG][YT]  JOIN US│
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [MKU CU LOGO]  Living the Knowledge of God                    │
│                                                                 │
│    Home  About▾  Events▾  Media▾  Resources▾  Blog  Prayer▾   │
│                                    Give  Contact  [WATCH LIVE🔴]│
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Sticky Header (on scroll):**
- Shrinks in height (logo smaller)
- Top bar hides
- Menu stays visible
- Background becomes solid with slight shadow
- Smooth transition animation

**Dropdown Menus (Desktop):**
- Appear on hover or click
- Fade in animation (150ms)
- Show on hover with 200ms delay (prevents accidental triggers)
- Submenu items with icons
- "Mega menu" style for Media section (with thumbnail previews)

#### Mobile Header (Detailed)
```
┌──────────────────────────────────┐
│ [MKU CU Logo]          [🔴] [☰] │
│ Living the Knowledge of God      │
└──────────────────────────────────┘
```
- Logo: Smaller, left-aligned
- Live badge: Red "LIVE" button (when service active)
- Hamburger: Three horizontal lines, transforms to X when menu open
- Sticky on scroll (shrinks slightly)

### Search Functionality (Global)

#### Desktop Search
- **Search icon** in main navigation
- Click → Expands search bar inline (smooth width animation)
- **Search input:**
  - Placeholder: "Search sermons, events, resources..."
  - Autocomplete suggestions dropdown
  - Categories filter (All, Sermons, Events, Blog, Resources)
  - Recent searches shown
  - Press Enter or click 🔍 to search

#### Mobile Search
- **Search icon** in mobile menu (top of menu items)
- Tap → Full-screen search overlay
- Large search input
- Voice search option (microphone icon)
- Suggested searches
- Recent searches history

#### Search Results Page
- **Filter sidebar (desktop) or top filters (mobile):**
  - Content Type (checkboxes): Sermons, Events, Blog Posts, Resources, Pages
  - Date Range: Anytime, Past Week, Past Month, Past Year
  - Sort By: Relevance, Newest First, Oldest First
  
- **Results display:**
  - Content type icon/badge
  - Title (clickable)
  - Excerpt with search term highlighted
  - Date
  - Thumbnail (if applicable)
  - Breadcrumb (e.g., Home > Media > Sermons)
  
- **No results state:**
  - "No results found for '[search term]'"
  - Suggestions: "Try different keywords" or "Browse our popular content"
  - Links to: Latest Sermons, Upcoming Events, Popular Blog Posts

### Performance Optimization Details

#### Image Optimization
- WebP format with JPG fallback
- Responsive images (srcset for different screen sizes)
- Lazy loading (images load as user scrolls)
- Blur placeholder while loading
- CDN hosting for media files

#### Code Optimization
- Minified CSS and JavaScript
- Critical CSS inline in `<head>`
- Async loading for non-critical scripts
- Font subsetting (only characters used)
- Reduce HTTP requests (combine files)

#### Caching Strategy
- Browser caching for static assets
- Service worker for PWA offline functionality
- Cache sermons and key pages for offline viewing

#### Speed Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1
- Overall PageSpeed Insights score: 90+

### Progressive Web App (PWA) Features

#### Installation
- "Add to Home Screen" prompt
- Custom app icon and splash screen
- Standalone mode (no browser UI)

#### Offline Functionality
- Service worker caches:
  - Homepage
  - About page
  - This week's events
  - Latest 5 sermons
  - Key resources
  
- Offline indicator: "You're offline. Showing cached content."
- Sync when back online

#### Push Notifications
- Request permission after user engagement
- Notification types:
  - Service starting soon (30 min before)
  - New sermon uploaded
  - Event reminder (1 day before)
  - Prayer request updates
  - Emergency/important announcements
  
- User can customize notification preferences

#### App-Like Features
- Pull-to-refresh on mobile
- Swipe gestures for navigation
- Bottom navigation bar (mobile)
- Smooth page transitions

### Accessibility Features (WCAG 2.1 AA)

#### Visual
- High contrast mode toggle
- Text size adjustment (A A+ A++)
- Focus indicators on all interactive elements
- Color not sole means of conveying information
- Minimum 4.5:1 contrast ratio for text

#### Navigation
- Skip to main content link
- Keyboard navigation support (all features accessible without mouse)
- Logical tab order
- ARIA landmarks (header, nav, main, aside, footer)

#### Content
- Alt text for all images
- Captions/transcripts for videos
- Descriptive link text (not "click here")
- Clear heading hierarchy (H1→H2→H3)
- Form labels and error messages

#### Assistive Technology
- Screen reader tested (NVDA, JAWS, VoiceOver)
- Semantic HTML5 elements
- ARIA labels where needed
- Status messages announced to screen readers

### Browser & Device Compatibility

#### Browsers (Last 2 versions)
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Samsung Internet
- ✅ Opera

#### Devices
- 📱 Mobile: 320px - 767px
- 📱 Tablet: 768px - 1024px
- 💻 Desktop: 1025px - 1920px
- 🖥️ Large Desktop: 1921px+

#### Testing
- Real device testing (iOS & Android)
- Browser DevTools responsive mode
- Cross-browser automated testing
- Accessibility audit tools
- Events registration
- Mission trip signups
- Leadership applications
- Membership registration
- Email confirmations

### 3. WhatsApp Integration
- **WhatsApp Community link** prominently displayed
- "Join our WhatsApp" floating button
- Share content via WhatsApp

### 4. Push Notifications (PWA)
- Event reminders
- Service time reminders
- New content alerts
- Prayer request updates

### 5. Search Functionality
- Global site search
- Search sermons, blogs, resources
- Filter results by type

### 6. Multi-language Support (Future)
- English (primary)
- Swahili (secondary)

### 7. Dark Mode Toggle
- User preference saved

### 8. Newsletter Signup
- Footer and popup forms
- MailChimp or similar integration
- Weekly updates, prayer points, event reminders

---

## Navigation Structure

### Main Menu (Desktop & Mobile)
- Home
- About (Dropdown: History, Vision & Mission, Leadership, Departments, Join Us)
- Events (Dropdown: Calendar, Upcoming Events, Weekly Schedule)
- Media (Dropdown: Sermons, Photos, Testimonies, Live)
- Resources (Dropdown: Bible Study, Devotionals, Downloads, Bible Online)
- Blog
- Prayer (Dropdown: Submit Request, Prayer Wall, Resources)
- Give
- Contact

### Mobile Menu
- Hamburger icon
- Slide-in side menu
- Same structure as desktop
- Quick action buttons at bottom: Call, WhatsApp, Email

---

## Conversion Elements (CTAs)

### Primary CTAs Throughout Site:
- "Join MKU CU Today"
- "Attend This Sunday"
- "Submit Prayer Request"
- "Give Now"
- "Watch Live Service"
- "Download Resources"
- "Contact Us"
- "Get Directions"

### Floating Action Buttons:
- WhatsApp chat
- Back to top
- Live service indicator (when active)

---

## Content Tone & Voice

- **Welcoming and Inclusive:** "We're glad you're here!"
- **Authentic and Relatable:** Real student stories, genuine faith struggles and victories
- **Inspirational but Grounded:** Biblical truth with practical application
- **Academic yet Spiritual:** Respect for knowledge and learning combined with faith
- **Youth-Focused:** Contemporary language, relevant to university students
- **Christ-Centered:** Always pointing back to Jesus

---

## Social Proof Elements

- Testimonies carousel on homepage
- Member count/attendance metrics
- Mission impact numbers (souls saved, schools reached, etc.)
- Alumni success stories
- Partner church endorsements

---

## Security & Privacy

- HTTPS/SSL certificate
- GDPR-compliant (data privacy notice)
- Secure form submissions
- Prayer request privacy options
- Moderated comments
- Anti-spam measures (reCAPTCHA)

---

## Analytics & Tracking

- Google Analytics 4
- Heatmaps (Hotjar or similar)
- Form conversion tracking
- Page performance monitoring
- Social media engagement tracking

---

## Maintenance & Updates

- Regular content updates (weekly: events, blog posts)
- Sermon uploads (weekly)
- Photo gallery updates (after events)
- Leadership changes (annually)
- Security patches and plugin updates

---

## Inspiration References (Design Elements to Incorporate)

### From MCCU (Main Campus Christian Union UON):
- Clean navigation structure
- Vision/Mission card layout
- Doctrinal basis presentation
- Leadership grid with photos and roles
- Recent media section
- Footer with quick links and location

### From Parkroad Fellowship:
- Bold hero section with clear tagline
- Activities/ministries icon cards
- Statement of beliefs expandable sections
- Stats counter (years, members, schools reached)
- "Become part of something great" CTA approach

### From MUCU (Maseno University):
- Modern, vibrant hero slider
- "Real Stories From Members" blog cards
- Ministry/department tabs or cards
- FAQ accordion section
- Newsletter signup emphasis
- Social media icons prominently displayed

### From JKUAT CU:
- Mission trip reporting (with photos and stories)
- Event-focused homepage
- Blog post with rich media (photos from missions)
- Community engagement emphasis
- Discover/Learn More CTAs

### From KUCU (Kenyatta University):
- Comprehensive ministry committee breakdown
- Clear weekly fellowship schedule
- Weekday and weekend services distinction
- Contact info with multiple channels
- University chaplaincy connection

### From MKU SDA Church:
- Appointment booking system
- Prayer request form
- Weekly program detailed schedule
- "How to Find Us" map section
- Gallery view slider
- Visitor registration/gatepass form

---

## Additional Features for MKU CU Uniqueness

### Theme Consistency
- **Annual Theme prominently displayed:** "Living the Knowledge of God (John 17:2-3)"
- Theme verse on every page footer or header
- Theme-related content series

### Student-Centric Features
- Academic year calendar integration
- Exam season prayer focus
- Hostel-based fellowships info
- Course-specific Bible studies (for different faculties)

### Campus Integration
- Links to MKU main website
- Campus map showing CU meeting venues
- University event calendar integration (where CU events are included)

### Mission Focus
- **Mission trips highlighted** with:
  - Pre-mission preparation resources
  - Live updates during missions (blog/social media feed)
  - Post-mission reports and testimonies
  - Photo and video galleries
  - Donation/support for missions
- Mission fields map (counties/areas reached)

### Leadership Development
- Leadership training resources
- Mentorship program information
- Speaker/preaching opportunities signup
- Ministry internship program

---

## Launch Checklist

### Pre-Launch:
- [ ] All pages content complete
- [ ] Images optimized
- [ ] Forms tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing
- [ ] Speed optimization (target: <3s load time)
- [ ] SEO meta tags complete
- [ ] Social media links active
- [ ] Contact info verified
- [ ] Privacy policy and terms pages
- [ ] SSL certificate installed
- [ ] Analytics tracking active

### Post-Launch:
- [ ] Submit to Google Search Console
- [ ] Create social media announcement posts
- [ ] Emai

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mkucuu.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b29c067e-2637-4d54-86c6-cffb247a4b18).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
