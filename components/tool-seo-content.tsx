import Link from "next/link";

import { toolDefinitions, type ToolDefinition } from "@/lib/tools/registry";

const siteUrl = "https://www.yzfl.top";

export function ToolSeoContent({ definition }: { definition: ToolDefinition }) {
  const pageUrl = `${siteUrl}/${definition.path}`;
  const relatedTools = toolDefinitions.filter((tool) => tool.slug !== definition.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#application`,
        name: definition.seo.h1,
        url: pageUrl,
        description: definition.metadata.description,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires a modern web browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
        isPartOf: {
          "@type": "WebSite",
          name: "知页",
          url: siteUrl,
        },
      },
    ],
  };

  return (
    <>
      <section className="tool-seo-content" aria-labelledby="tool-seo-title">
        <div className="tool-seo-content__intro">
          <p className="tool-seo-content__eyebrow">工具说明</p>
          <h2 id="tool-seo-title">{definition.seo.heading}</h2>
          <p>{definition.seo.intro}</p>
        </div>

        <div className="tool-seo-content__grid">
          <section aria-labelledby="tool-features-title">
            <h3 id="tool-features-title">支持的功能</h3>
            <ul>
              {definition.seo.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
          </section>
          <section aria-labelledby="tool-steps-title">
            <h3 id="tool-steps-title">使用方法</h3>
            <ol>
              {definition.seo.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        </div>

        <div className="tool-seo-content__article">
          {definition.seo.sections.map((section, index) => (
            <section key={section.heading} aria-labelledby={`tool-section-${index}`}>
              <h3 id={`tool-section-${index}`}>{section.heading}</h3>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </div>

        <section className="tool-seo-content__faq" aria-labelledby="tool-faq-title">
          <h3 id="tool-faq-title">常见问题</h3>
          <div>
            {definition.seo.faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <nav className="tool-seo-content__related" aria-labelledby="related-tools-title">
          <h3 id="related-tools-title">相关工具</h3>
          <ul>
            {relatedTools.map((tool) => (
              <li key={tool.slug}>
                <Link href={`/${tool.path}`}>
                  <span>{tool.title}</span>
                  <small>{tool.seo.summary}</small>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
