// Utility to convert HTML templates to Unlayer design format
// This is a simplified converter - you might need to enhance it based on your specific needs

export interface UnlayerDesign {
  counters: {
    u_column: number;
    u_row: number;
    u_content_text: number;
    u_content_image: number;
    u_content_button: number;
    u_content_divider: number;
    u_content_spacer: number;
    u_content_menu: number;
    u_content_social: number;
    u_content_footer: number;
  };
  body: {
    id: string;
    rows: any[];
    values: {
      backgroundColor: string;
      contentWidth: string;
      contentAlign: string;
      fontFamily: {
        label: string;
        value: string;
      };
      textColor: string;
      linkStyle: {
        textDecoration: string;
        color: string;
      };
      _meta: {
        htmlID: string;
        htmlClassNames: string;
      };
    };
  };
}

// Convert HTML to Unlayer design format
export const htmlToUnlayerDesign = (html: string): UnlayerDesign => {
  // This is a basic implementation - you might need to enhance it
  // based on your specific HTML structure and Unlayer requirements
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract basic styling information
  const body = doc.body;
  const styles = doc.querySelector('style')?.textContent || '';
  
  // Get background color from styles or body
  const backgroundColor = extractBackgroundColor(styles, body);
  
  // Get font family from styles
  const fontFamily = extractFontFamily(styles);
  
  // Get text color from styles
  const textColor = extractTextColor(styles);
  
  // Create basic Unlayer design structure
  const design: UnlayerDesign = {
    counters: {
      u_column: 0,
      u_row: 0,
      u_content_text: 0,
      u_content_image: 0,
      u_content_button: 0,
      u_content_divider: 0,
      u_content_spacer: 0,
      u_content_menu: 0,
      u_content_social: 0,
      u_content_footer: 0,
    },
    body: {
      id: 'body',
      rows: [],
      values: {
        backgroundColor: backgroundColor || '#ffffff',
        contentWidth: '600px',
        contentAlign: 'center',
        fontFamily: {
          label: fontFamily || 'Arial',
          value: fontFamily || 'Arial',
        },
        textColor: textColor || '#000000',
        linkStyle: {
          textDecoration: 'underline',
          color: '#0000ee',
        },
        _meta: {
          htmlID: 'body',
          htmlClassNames: '',
        },
      },
    },
  };
  
  // Convert HTML content to Unlayer rows
  const rows = convertHtmlToRows(body);
  design.body.rows = rows;
  
  return design;
};

// Helper function to extract background color
const extractBackgroundColor = (styles: string, body: HTMLElement): string => {
  const bgColorMatch = styles.match(/background-color:\s*([^;]+)/i);
  if (bgColorMatch) {
    return bgColorMatch[1].trim();
  }
  
  const bodyStyle = body.style.backgroundColor;
  if (bodyStyle) {
    return bodyStyle;
  }
  
  return '#ffffff';
};

// Helper function to extract font family
const extractFontFamily = (styles: string): string => {
  const fontMatch = styles.match(/font-family:\s*([^;]+)/i);
  if (fontMatch) {
    return fontMatch[1].trim().replace(/['"]/g, '');
  }
  return 'Arial';
};

// Helper function to extract text color
const extractTextColor = (styles: string): string => {
  const colorMatch = styles.match(/color:\s*([^;]+)/i);
  if (colorMatch) {
    return colorMatch[1].trim();
  }
  return '#000000';
};

// Convert HTML content to Unlayer rows
const convertHtmlToRows = (body: HTMLElement): any[] => {
  const rows: any[] = [];
  
  // This is a simplified conversion - you might need to enhance it
  // based on your specific HTML structure
  
  // Find all tables and convert them to rows
  const tables = body.querySelectorAll('table');
  
  tables.forEach((table, index) => {
    const row = {
      id: `row_${index}`,
      cells: [1],
      columns: [
        {
          id: `column_${index}`,
          contents: [
            {
              id: `content_${index}`,
              type: 'text',
              values: {
                containerPadding: '10px',
                anchor: '',
                fontSize: '14px',
                textAlign: 'left',
                lineHeight: '140%',
                linkStyle: {
                  inherit: true,
                  linkColor: '#0000ee',
                  linkHoverColor: '#0000ee',
                  linkUnderline: true,
                  linkHoverUnderline: true,
                },
                text: table.outerHTML,
                _meta: {
                  htmlID: `content_${index}`,
                  htmlClassNames: '',
                },
              },
            },
          ],
          values: {
            backgroundColor: '',
            padding: '0px',
            border: {},
            _meta: {
              htmlID: `column_${index}`,
              htmlClassNames: '',
            },
          },
        },
      ],
      values: {
        displayCondition: null,
        columns: false,
        backgroundColor: '',
        columnsBackgroundColor: '',
        backgroundImage: {
          url: '',
          fullWidth: true,
          repeat: 'no-repeat',
          size: 'custom',
          position: 'center',
        },
        padding: '0px',
        anchor: '',
        hideDesktop: false,
        _meta: {
          htmlID: `row_${index}`,
          htmlClassNames: '',
        },
      },
    };
    
    rows.push(row);
  });
  
  return rows;
};

// Alternative approach: Load HTML directly as text content
export const htmlToUnlayerTextContent = (html: string): any => {
  return {
    counters: {
      u_column: 0,
      u_row: 0,
      u_content_text: 0,
      u_content_image: 0,
      u_content_button: 0,
      u_content_divider: 0,
      u_content_spacer: 0,
      u_content_menu: 0,
      u_content_social: 0,
      u_content_footer: 0,
    },
    body: {
      id: 'body',
      rows: [
        {
          id: 'row_0',
          cells: [1],
          columns: [
            {
              id: 'column_0',
              contents: [
                {
                  id: 'content_0',
                  type: 'text',
                  values: {
                    containerPadding: '10px',
                    anchor: '',
                    fontSize: '14px',
                    textAlign: 'left',
                    lineHeight: '140%',
                    linkStyle: {
                      inherit: true,
                      linkColor: '#0000ee',
                      linkHoverColor: '#0000ee',
                      linkUnderline: true,
                      linkHoverUnderline: true,
                    },
                    text: html,
                    _meta: {
                      htmlID: 'content_0',
                      htmlClassNames: '',
                    },
                  },
                },
              ],
              values: {
                backgroundColor: '',
                padding: '0px',
                border: {},
                _meta: {
                  htmlID: 'column_0',
                  htmlClassNames: '',
                },
              },
            },
          ],
          values: {
            displayCondition: null,
            columns: false,
            backgroundColor: '',
            columnsBackgroundColor: '',
            backgroundImage: {
              url: '',
              fullWidth: true,
              repeat: 'no-repeat',
              size: 'custom',
              position: 'center',
            },
            padding: '0px',
            anchor: '',
            hideDesktop: false,
            _meta: {
              htmlID: 'row_0',
              htmlClassNames: '',
            },
          },
        },
      ],
      headers: [],
      footers: [],
      values: {
        backgroundColor: '#ffffff',
        contentWidth: '600px',
        contentAlign: 'center',
        fontFamily: {
          label: 'Arial',
          value: 'Arial',
        },
        textColor: '#000000',
        linkStyle: {
          textDecoration: 'underline',
          color: '#0000ee',
        },
        _meta: {
          htmlID: 'body',
          htmlClassNames: '',
        },
      },
    },
  };
};
