# 🚀 FirstStep — AI-Powered CV & Job Matcher

> პირველი ნაბიჯი სწორი კარიერისკენ

**Live Demo:** [first-step-phi-khaki.vercel.app](https://first-step-phi-khaki.vercel.app/)

---

## 📌 პროექტის შესახებ

FirstStep არის AI-ზე დაფუძნებული ვებ-აპლიკაცია, რომელიც ეხმარება ახალბედა კანდიდატებს და სტუდენტებს:

- CV-ის ატვირთვასა და AI-ს მიერ ანალიზში
- ვაკანსიების შესაბამისობის პროცენტის გაანგარიშებაში
- ATS keywords-ის შემოწმებასა და გაუმჯობესების რჩევების მიღებაში

**სამიზნე აუდიტორია:** სტუდენტები და გამოუცდელი სამუშაო მაძიებლები (18–28 წელი)

---

## ✨ ფუნქციები

| ფუნქცია | აღწერა |
|---------|--------|
| 📄 CV Upload | PDF/Word ფაილის ატვირთვა და ანალიზი |
| 🎯 Job Match % | ვაკანსიასთან შესაბამისობის პროცენტი |
| 💡 AI Suggestions | პერსონალური გაუმჯობესების რჩევები |
| 🔍 Keywords Check | ATS-ისთვის მნიშვნელოვანი სიტყვების შემოწმება |

---

## 🛠️ Tech Stack

- **AI:** Google Gemini API (via Google AI Studio)
- **Frontend:** HTML / CSS / JavaScript
- **Development:** Replit
- **Version Control:** GitHub
- **Deployment:** Vercel

---

## 🤖 Prompt Engineering

პროექტის შექმნისას გამოყენებული მთავარი პრომპტების ევოლუცია:

### საიტის კოდი — Iteration

**v1 (ძალიან ზოგადი):**
```
Make a CV analyzer website
```
შედეგი: template-like, ფუნქციონალი სუსტი

**v2 (უკეთესი, მაგრამ UI სუსტი):**
```
Build a job matcher that compares CV to job descriptions using Gemini API
```

**v3 — საბოლოო (დეტალური და კონტექსტური):**
```
Create a modern, dark-themed CV & job matching tool with file upload,
AI analysis showing match %, missing keywords, and personalized suggestions.
Use Google Gemini API. Target audience: young Georgian jobseekers aged 18-28.
UI should be clean, mobile-friendly, with clear results dashboard.
```

### PRD დოკუმენტი
```
Write a Product Requirements Document for a CV & Job Matching web app
targeting Georgian students aged 18-28. Include: problem statement,
target users, core features, success metrics, and tech stack.
```

### Hero Image (AI-generated)
```
Minimalist illustration: a person holding a glowing CV document,
soft gradient background blue to teal, flat design style,
no text, professional and modern
```

### Hero Section Copy
```
Write hero section headline and subheadline for a job matching app.
Tone: friendly, confident, encouraging for young jobseekers.
Georgian market context. Keep it under 15 words per line.
```

---

## 🔬 Design Thinking პროცესი

1. **Empathize** — ინტერვიუები სტუდენტებთან, survey (n=20)
2. **Define** — HMW: "როგორ შეგვიძლია დავეხმაროთ ახალბედა კანდიდატებს AI-ს გამოყენებით?"
3. **Ideate** — feature brainstorm, competitor analysis
4. **Prototype** — Google AI Studio → Vercel deploy
5. **Test** — user feedback, iteration

### კვლევის ძირითადი მოსაზრებები
- 73% — CV-ის დაწერა რთულად მიაჩნია
- 68% — არ იცის ATS სისტემა რა არის
- 81% — სამუშაოს ძიებაში 2+ კვირას ხარჯავს

---

## 🚀 როგორ გავუშვა ლოკალურად

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/firststep.git

# Open in browser
open index.html
```

> **.env ფაილში** დაამატე Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

---

## 📁 პროექტის სტრუქტურა

```
firststep/
├── index.html          # მთავარი გვერდი
├── style.css           # სტილები
├── script.js           # ლოგიკა + Gemini API
├── assets/
│   ├── hero.png        # AI-generated hero image
│   └── logo.svg        # AI-generated logo
└── README.md
```

---

## 🔮 სამომავლო გეგმები

- [ ] **v2** — ქართული ვაკანსიების ბაზა (jobs.ge ინტეგრაცია)
- [ ] **v3** — User accounts & CV ისტორია
- [ ] **v4** — კოვერ ლეტერის AI გენერატორი
- [ ] **v5** — Mobile app (React Native)

---

## 👩‍💻 ავტორი

**Mariam** — Design Thinking Project, 2025  
Built with: Google AI Studio • GitHub • Vercel • Replit

---

*"FirstStep-ი არ ჩვენ შევქმენით — First Step-მა ჩვენ შეგვქმნა."*
