import { OutlineType, Section } from "@/domain/outline";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  InternalHyperlink,
  Table,
  TableRow,
  TableCell,
  WidthType,
  LevelFormat,
} from "docx";

export async function convertToDocx(data: OutlineType){
  const focusKeywordObject =
    data["Keywords’ global search volume"]["Focus keyword"];
  const firstPropertyKey = Object.keys(focusKeywordObject)[0];
  const firstPropertyValue = focusKeywordObject[firstPropertyKey];

  const cellMargin = {
    top: 150,    // Top padding
    bottom: 150, // Bottom padding
    left: 150,   // Left padding
    right: 150   // Right padding
  };
  

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "my-numbering",
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: "%1.",
              alignment: "left",
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 260 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: data.Title,
                bold: true,  // This property sets the text to be bold
              }),
            ],
            heading: HeadingLevel.TITLE,
            spacing: {
              after: 600,
            }
          }),
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Brief")],
                    margins: cellMargin
                  }),
                  new TableCell({
                    children: [new Paragraph(data.Brief)],
                    margins: cellMargin
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("URL")],
                    margins: cellMargin
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new InternalHyperlink({
                            children: [new TextRun({
                              text: data.URL, // The visible text
                              style: 'Hyperlink' // Make sure to define a Hyperlink style or ensure it's blue and underlined
                            })],
                            anchor: data.URL, // The actual URL the link points to
                          })
                        ]
                      })
                    ],
                    // children: [new Paragraph(data.URL)],
                    margins: cellMargin
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Word Count")],
                    margins: cellMargin
                  }),
                  new TableCell({
                    children: [new Paragraph(data["Word Count"])],
                    margins: cellMargin
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Target Intent")],
                    margins: cellMargin
                  }),
                  new TableCell({
                    children: [new Paragraph(data["Target Intent"])],
                    margins: cellMargin
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Target Audience")],
                    margins: cellMargin
                  }),
                  new TableCell({
                    children: [
                      ...data["Target Audience"].map((audience: string) => {
                        return new Paragraph({
                          text: audience,
                          numbering: {
                            reference: "my-numbering",
                            level: 0,
                          },
                        });
                      }),
                    ],
                    margins: cellMargin
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Page Template")],
                    margins: cellMargin
                  }),
                  new TableCell({
                    children: [new Paragraph(data["Page Template"])],
                    margins: cellMargin
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Focus Keyword")],
                    margins: cellMargin
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: firstPropertyKey,
                          }),
                          new TextRun({
                            text: `\t${firstPropertyValue}`,
                          }),
                        ],
                        tabStops: [
                          {
                            type: "left",
                            position: 0,
                          },
                          {
                            type: "right",
                            position: 7800,
                          },
                        ],
                      }),
                    ],
                    margins: cellMargin,
                    columnSpan: 2,
                  }),
                ],
              }),

              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Longtail KWs")],
                    margins: cellMargin
                  }),
                  new TableCell({
                    children: [
                      ...Object.entries(
                        data["Keywords’ global search volume"]["Longtail KWs"]
                      ).map(([keyword, volume]) => {
                        return new Paragraph({
                          children: [
                            new TextRun({
                              text: keyword + "\t",
                            }),
                            new TextRun({
                              text: `${volume}`,
                            }),
                          ],
                          tabStops: [
                            {
                              type: "left",
                              position: 0,
                            },
                            {
                              type: "right",
                              position: 7800,
                            },
                          ],
                        });
                      }),
                    ],
                    margins: cellMargin,
                    columnSpan: 2,
                  }),
                ],
              }),
            ],
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Commonly Asked Questions",
                bold: true, // Make the text bold
                color: "000000", // Set the text color to black using hex code
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 600,
              after: 200
            },
          }),
          ...data["Commonly Asked Questions"].map((question: string) => {
            return new Paragraph({
              text: question,
              bullet: {
                level: 0,
              },
            });
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Suggested Outline",
                bold: true, // Make the text bold
                color: "000000", // Set the text color to black using hex code
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 300,
              after: 300
            },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "H1 Title: " + data["Suggested Outline"].h1,
                bold: true, // Make the text bold
                color: "000000", // Set the text color to black using hex code
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              after: 300,
            },
          }),
          ...data["Suggested Outline"].Sections.map((section: Section, index: number, array: Section[]) => {
            const sectionHeader = new Paragraph({
              children: [
                new TextRun({
                  text: "H2 Title: " + section.h2,
                  bold: true, // Make the text bold
                  color: "000000", // Set the text color to black using hex code
                }),
              ],
              heading: HeadingLevel.HEADING_2,
            });
          
            const contentParagraphs = section.Content?.map(content => 
              new Paragraph({
                text: content,
                bullet: {
                  level: 0,
                },
              })
            ) || [];
          
            // Create a spacer paragraph for the gap
            const spacerParagraph = new Paragraph({
              text: "",
              spacing: {
                after: 300, // Adjust this value to control the size of the gap
              },
            });
          
            // Combine the section elements and add the spacer
            // Avoid adding spacer after the last section
            return [
              sectionHeader, 
              ...contentParagraphs, 
              ...(index === array.length - 1 ? [] : [spacerParagraph])
            ];
          }).flat(),
          
          new Paragraph({
            children: [
              new TextRun({
                text: "Highlighted Referenced Links",
                bold: true, // Make the text bold
                color: "000000", // Set the text color to black using hex code
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: {
              before: 600,
              after: 300,
            },
          }),
          ...data["Highlighted Referenced Links"].map((link: string) => {
            return new Paragraph({
              children: [
                new InternalHyperlink({
                  children: [
                    new TextRun({
                      text: link,
                      style: "Hyperlink",
                    }),
                  ],
                  anchor: link,
                }),
              ],
            });
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return buffer;

}