import * as cheerio from "cheerio";

export const sanitizeHtml = (html: string) => {
  const $ = cheerio.load(html);

  $("script, iframe, object, embed").remove();

  $("[onerror], [onload], [onclick], [onmouseover], [onfocus]").each((_, el) => {
    Object.keys(el.attribs).forEach((attr) => {
      if (attr.startsWith("on")) $(el).removeAttr(attr);
    });
  });

  $("a[href]").each((_, anchor) => {
    const href = $(anchor).attr("href") || "";

    if (!href.includes("truescholar.in")) {
      $(anchor).attr("rel", "nofollow noopener noreferrer");
      $(anchor).attr("target", "_blank");
    }
  });

  $("table").each((_, table) => {
    const $table = $(table);
    if ($table.find("th").length === 0) {
      const firstRow = $table.find("tr").first();
      firstRow.children("td").each((_, td) => {
        $(td).replaceWith(`<th>${$(td).html()}</th>`);
      });
      firstRow.wrap("<thead></thead>");
    }
  });

  return $.html();
};
