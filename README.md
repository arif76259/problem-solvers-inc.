# Problem Solvers Inc.

Build this app using the HTML files referenced below. You can hotlink the images referenced in the HTML. The attached images are screenshots of the desired screens. Here are public links to the html of the screens which you should read and use to build the app:

1. https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YmNmYmY1ZDk3NDQwMWE2MmQxOWZjMjc5MWQ1EgsSBxDSlIywwwwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTQ5NTIyMDcwNjE0NTk0MDQwOQ&filename=&opi=89354086
2. https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzAwMDY1YmNmYmY0YzIzZGEwNzNhY2ZkNGZjMTNjMjc0EgsSBxDSlIywwwwYAZIBJAoKcHJvamVjdF9pZBIWQhQxMTQ5NTIyMDcwNjE0NTk0MDQwOQ&filename=&opi=89354086

Act as a senior full-stack software engineer and product architect.

I am building a new Bangladesh-based product development and international sourcing business.

Business Model

Our business model is:

Customer problem identification → market research → future-demand analysis → product concept → overseas manufacturing/sourcing (primarily China, Japan, and potentially other countries) → prototype → customer testing → small-batch import → Bangladesh market launch → product improvement → large-scale distribution → eventually international expansion/export.

We do NOT want the website to look like a generic import-export company or a simple e-commerce store.

The website should communicate that we discover real customer problems and develop/source better products to solve them.

One of our initial marketing campaigns is:

“100 Early Customers”

The concept is to recruit the first 100 customers who will test an upcoming product, provide feedback, receive early access, and become part of the product-development journey.

Primary Website Objectives

Build a modern, scalable company website that can:

Introduce the company and its business model.

Explain how we discover and develop products.

Showcase current and upcoming products.

Collect customer interest and early-access registrations.

Run the “100 Early Customers” campaign.

Collect structured customer feedback.

Build an email/lead database.

Support future e-commerce functionality.

Provide a platform for future B2B partnerships.

Eventually support international customers and export operations.

Recommended Website Structure

Create the architecture around these pages:

Home

About Us

How We Build

Products

Upcoming Products

100 Early Customers

Product Research / Insights

B2B / Partnership

Contact

FAQ

Privacy Policy

Terms & Conditions

The architecture must allow additional product categories, campaigns, countries, and markets to be added later without rebuilding the entire system.

Core Functional Requirements

1. Homepage

Include:

Strong value proposition

Current product/launch

“100 Early Customers” CTA

How the company works

Featured products

Product development story

Customer feedback/social proof

Future vision

Newsletter/early-access signup

Primary CTA:

“Become One of the 100”

Secondary CTA:

“Explore Our Products”

2. Early Customer Registration

Create a dedicated registration system for the first 100 customers.

Collect:

Full name

Email

Phone

Location

Age range

Occupation

Product interest

Main problem they want solved

Preferred price range

How they discovered us

Consent for communication

After submission:

Generate a unique registration ID.

Store the information securely.

Show confirmation.

Send confirmation email.

Display early-customer status where appropriate.

The system should prevent duplicate registrations using appropriate validation.

3. Product System

Build products as database-driven entities rather than hardcoded pages.

Each product should support:

Product name

Category

Description

Problem solved

Key features

Images

Videos

Specifications

Manufacturing/source country

Development stage

Availability status

Price

Customer reviews

FAQs

Related products

Possible product statuses:

Research

Concept

Prototype

Testing

Early Access

Launching Soon

Available

Sold Out

Discontinued

4. Product Feedback System

Create a feedback mechanism for early customers.

Allow users to submit:

Rating

Experience

Problems encountered

Suggested improvements

Feature requests

Optional photo/video

Create an admin interface where feedback can be reviewed and categorized.

5. Lead Management

All website leads should be stored in a structured database.

Create lead categories:

Early Customer

General Customer

B2B Lead

Distributor

Retailer

Manufacturer

Partnership

Media

Investor/Business Inquiry

Include timestamps and source tracking.

6. Admin Dashboard

Build an admin dashboard with:

Total registrations

Number of early customers

Product interest

Lead sources

Customer feedback

Product performance

Conversion rate

Newsletter subscribers

B2B inquiries

Allow administrators to manage:

Products

Campaigns

Registrations

Feedback

Blog/insights

FAQs

Website content

Technical Requirements

Use a modern production-ready stack.

Recommended example:

Frontend:

Next.js

TypeScript

Tailwind CSS

Backend:

Next.js API routes/server actions or a scalable backend

Database:

PostgreSQL

Authentication:

Secure admin authentication

Role-based access control

Infrastructure:

Cloud deployment

CDN

Image optimization

Automated backups

Email:

Transactional email service

Confirmation emails

Early-access notifications

Analytics:

Google Analytics 4

Meta Pixel

Conversion tracking

UTM tracking

Security Requirements

Implement:

Input validation

Server-side validation

Rate limiting

CAPTCHA where appropriate

SQL injection protection

XSS protection

CSRF protection where applicable

Secure authentication

Password hashing

Environment-variable based secrets

Database access control

Secure API endpoints

Privacy-conscious analytics

Do not expose sensitive customer information through frontend APIs.

Performance Requirements

Target:

Excellent Core Web Vitals

Fast mobile loading

Optimized images

Lazy loading

Minimal JavaScript

SEO-friendly server rendering

Responsive design

Accessible navigation

The website must work well on low-to-medium bandwidth mobile connections because the initial market is Bangladesh.

SEO Requirements

Implement:

Semantic HTML

Metadata

Open Graph

Twitter/X cards

Structured data/schema markup

XML sitemap

robots.txt

Canonical URLs

Product schema where appropriate

Organization schema

FAQ schema where appropriate

Create SEO-friendly URLs.

Analytics & Conversion Tracking

Track:

Homepage CTA clicks

Early customer registrations

Product page views

Product interest submissions

Form abandonment

Newsletter signups

B2B inquiries

Campaign source

Device type

Geographic distribution

Build the system so marketing campaigns can be measured independently.

Scalability

The first version should be an MVP, but the architecture must allow future features such as:

Full e-commerce

Online payment

Shopping cart

Customer accounts

Order tracking

Loyalty program

Referral system

Distributor portal

B2B wholesale portal

International shipping

Multi-language support

Multi-currency support

Mobile application/API

Do not over-engineer the MVP.

Build the smallest reliable architecture that can evolve into a full product-commerce platform.

Deliverables

Before writing code:

Analyze the business requirements.

Define the technical architecture.

Define the database schema.

Define API requirements.

Define authentication and security model.

Define page/component architecture.

Define the MVP scope.

Identify future scalability considerations.

Then implement the website systematically.

Prioritize:

Reliability → Security → Performance → Maintainability → Scalability → Visual polish.

The final product should feel like a serious technology-enabled product company, not a traditional trading/import-export website.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/709389e8-d967-42ec-b236-468e468af686).

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
