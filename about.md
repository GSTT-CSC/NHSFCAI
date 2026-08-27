---
layout: page
permalink: /about/
title: About the fellowship
description: Background to the NHS Fellowship in Clinical AI, the first systematic UK route to clinical AI deployment skills, and testimonials from fellows.
---
## Background

Clinical leaders with expertise in Artificial Intelligence are essential to the integration and rollout of AI software in NHS trusts. 
To deliver the UK government's plan of making [the NHS the most AI-enabled workforce in the world by 2035](https://assets.publishing.service.gov.uk/media/6888a0b1a11f859994409147/fit-for-the-future-10-year-health-plan-for-england.pdf#page=100), the NHS must provide dedicated training for clinicians in cutting-edge skills required for clinical AI deployment.
This fellowship is the first systematic route in the UK to acquire the relevant skills in clinical AI deployment. Fellows gain expertise in clinical AI alongside their existing roles and implement state-of-the-art AI software in live hospital environments.

Fellows are matched with an expert AI supervisor and team to gain experience in real-world applications of clinical AI. Fellows gain skills and knowledge relevant to the full life cycle of healthcare AI from a bespoke programme of teaching aligned with the Clinical AI Curriculum developed by the faculty.
As a lasting legacy of the fellowship, fellows become part of a uniquely networked community of interest within the healthcare AI community.

This unique programme is featured as an exemplar in upskilling clinicians for AI transformation in both the *[NHS Long Term Workforce Plan (2023)](https://www.england.nhs.uk/wp-content/uploads/2023/06/nhs-long-term-workforce-plan-v1.2.pdf#page=74)* and the NHS Transformation Directorate report, *[Developing Healthcare Workers' Confidence in AI (2022)](https://digital-transformation.hee.nhs.uk/binaries/content/assets/digital-transformation/dart-ed/developingconfidenceinai-oct2022.pdf#page=68)*. 
The fellowship builds directly from the recommendation of the *[Topol Review (2019)](https://topol.hee.nhs.uk/wp-content/uploads/HEE-Topol-Review-2019.pdf#page=8)* to create posts for clinicians with dedicated time to implement AI technologies.

The fellowship is delivered by the [Clinical Scientific Computing team](https://gstt-csc.github.io) of Guy's and St Thomas' NHS Foundation Trust.



## Testimonials

{% for t in site.data.testimonials %}
<div style="display: flex; align-items: center; margin-bottom: 2rem;">
  <img class="mx-auto p-1" style="width: 150px; border-radius: 50%; flex-shrink: 0; margin-right: 1rem;" src="{{ t.image }}" alt="{{ t.name }} headshot">
  <p>
    <em>{{ t.text }}</em><br/><br/>
    <a href="{{ t.link }}">{{ t.name }}</a> ({{ t.year }}), {{ t.role }}
  </p>
</div>
{% endfor %}