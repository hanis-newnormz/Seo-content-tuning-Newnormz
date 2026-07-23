function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SCHOOL_HOMEPAGE_SCREENSHOT = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
  <rect width="1200" height="750" fill="#ffffff"/>
  <rect width="1200" height="72" fill="#ffffff"/>
  <rect y="71" width="1200" height="1" fill="#e5e7eb"/>
  <circle cx="52" cy="36" r="16" fill="#1e3a8a"/>
  <text x="80" y="42" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#1e293b">ABC International School</text>
  <text x="760" y="42" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#475569">Admissions</text>
  <text x="870" y="42" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#475569">Academics</text>
  <text x="980" y="42" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#475569">About</text>
  <rect x="1060" y="20" width="110" height="34" rx="6" fill="#1e3a8a"/>
  <text x="1080" y="42" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#ffffff">Enquire Now</text>

  <rect x="0" y="72" width="1200" height="380" fill="#0f2a63"/>
  <rect x="0" y="72" width="1200" height="380" fill="#1e3a8a" opacity="0.15"/>
  <text x="600" y="230" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff">Welcome to ABC School</text>
  <text x="600" y="270" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="17" fill="#c7d2fe">We provide quality education.</text>
  <rect x="510" y="310" width="180" height="46" rx="6" fill="#ffffff"/>
  <text x="600" y="339" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="600" fill="#1e3a8a">Learn More</text>

  <text x="600" y="500" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="700" fill="#1e293b">Why Families Choose Us</text>

  <rect x="80" y="540" width="320" height="150" rx="10" fill="#f8fafc" stroke="#e5e7eb"/>
  <circle cx="130" cy="580" r="16" fill="#1e3a8a" opacity="0.15"/>
  <text x="110" y="625" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1e293b">Experienced Teachers</text>
  <text x="110" y="650" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#64748b">Qualified international faculty</text>

  <rect x="440" y="540" width="320" height="150" rx="10" fill="#f8fafc" stroke="#e5e7eb"/>
  <circle cx="490" cy="580" r="16" fill="#1e3a8a" opacity="0.15"/>
  <text x="470" y="625" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1e293b">Modern Campus</text>
  <text x="470" y="650" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#64748b">State-of-the-art facilities</text>

  <rect x="800" y="540" width="320" height="150" rx="10" fill="#f8fafc" stroke="#e5e7eb"/>
  <circle cx="850" cy="580" r="16" fill="#1e3a8a" opacity="0.15"/>
  <text x="830" y="625" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#1e293b">Global Curriculum</text>
  <text x="830" y="650" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#64748b">Cambridge-aligned syllabus</text>

  <rect x="0" y="720" width="1200" height="30" fill="#0f172a"/>
  <text x="600" y="740" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#94a3b8">© ABC International School</text>
</svg>
`);

export const SCHOOL_ABOUT_SCREENSHOT = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <rect width="1200" height="700" fill="#ffffff"/>
  <rect width="1200" height="72" fill="#ffffff"/>
  <rect y="71" width="1200" height="1" fill="#e5e7eb"/>
  <circle cx="52" cy="36" r="16" fill="#1e3a8a"/>
  <text x="80" y="42" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#1e293b">ABC International School</text>

  <text x="80" y="150" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#1e293b">About Us</text>
  <rect x="80" y="185" width="640" height="12" rx="6" fill="#e2e8f0"/>
  <rect x="80" y="210" width="600" height="12" rx="6" fill="#e2e8f0"/>
  <rect x="80" y="235" width="520" height="12" rx="6" fill="#e2e8f0"/>

  <text x="80" y="320" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#1e293b">Meet Our Leadership</text>

  <circle cx="150" cy="400" r="45" fill="#dbeafe"/>
  <text x="90" y="470" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#1e293b">Dr. Sarah Lim</text>
  <text x="90" y="490" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#64748b">Principal</text>

  <circle cx="430" cy="400" r="45" fill="#dbeafe"/>
  <text x="370" y="470" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#1e293b">James Wong</text>
  <text x="370" y="490" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#64748b">Head of Academics</text>

  <circle cx="710" cy="400" r="45" fill="#dbeafe"/>
  <text x="650" y="470" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#1e293b">Priya Nair</text>
  <text x="650" y="490" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#64748b">Admissions Director</text>

  <rect x="0" y="660" width="1200" height="30" fill="#0f172a"/>
  <text x="600" y="680" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#94a3b8">© ABC International School</text>
</svg>
`);

export const CAFE_HOMEPAGE_SCREENSHOT = svgToDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="680" viewBox="0 0 1200 680">
  <rect width="1200" height="680" fill="#fffaf3"/>
  <rect width="1200" height="72" fill="#fffaf3"/>
  <rect y="71" width="1200" height="1" fill="#f0e0c8"/>
  <circle cx="52" cy="36" r="16" fill="#9a3412"/>
  <text x="80" y="42" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="#7c2d12">Sunrise Café</text>
  <text x="960" y="42" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#7c2d12">Menu</text>
  <text x="1040" y="42" font-family="Helvetica, Arial, sans-serif" font-size="14" fill="#7c2d12">Locations</text>

  <rect x="0" y="72" width="1200" height="330" fill="#7c2d12"/>
  <text x="600" y="220" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="38" font-weight="700" fill="#ffffff">Good Coffee, Good Mood</text>
  <text x="600" y="260" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="16" fill="#fed7aa">Come say hi.</text>
  <rect x="520" y="300" width="160" height="44" rx="22" fill="#ffffff"/>
  <text x="600" y="327" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="600" fill="#7c2d12">Order Online</text>

  <text x="600" y="460" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#431407">Our Locations</text>
  <rect x="150" y="500" width="900" height="120" rx="10" fill="#fff1e0" stroke="#f0d9b5"/>
  <text x="180" y="545" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" fill="#431407">Bangsar</text>
  <text x="180" y="570" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#7c5a3a">Open daily, 8am–6pm</text>

  <rect x="0" y="650" width="1200" height="30" fill="#431407"/>
  <text x="600" y="670" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#d9b896">© Sunrise Café</text>
</svg>
`);
