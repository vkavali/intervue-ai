// Remote cursor display using Monaco deltaDecorations
// Shows a colored cursor line + name label for remote users

import type { editor as monacoEditor } from "monaco-editor";

interface RemoteCursorState {
  decorationIds: string[];
  lineNumber: number;
  column: number;
  userName: string;
}

const CURSOR_COLORS = [
  "#FF6B6B", // red
  "#4ECDC4", // teal
  "#FFE66D", // yellow
  "#95E1D3", // mint
  "#F38181", // coral
  "#AA96DA", // lavender
];

function getColorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export class RemoteCursorManager {
  private editor: monacoEditor.IStandaloneCodeEditor;
  private cursors: Map<string, RemoteCursorState> = new Map();
  private styleElement: HTMLStyleElement | null = null;

  constructor(editor: monacoEditor.IStandaloneCodeEditor) {
    this.editor = editor;
    // Create style element for cursor CSS
    this.styleElement = document.createElement("style");
    document.head.appendChild(this.styleElement);
  }

  /**
   * Update a remote user's cursor position.
   */
  updateCursor(userId: string, userName: string, lineNumber: number, column: number) {
    const color = getColorForUser(userId);
    const className = `remote-cursor-${userId.replace(/[^a-zA-Z0-9]/g, "")}`;
    const labelClassName = `${className}-label`;

    // Add CSS for this cursor if not already added
    if (this.styleElement) {
      const existingRules = this.styleElement.textContent || "";
      if (!existingRules.includes(className)) {
        this.styleElement.textContent += `
          .${className} {
            border-left: 2px solid ${color} !important;
            margin-left: -1px;
          }
          .${labelClassName} {
            background-color: ${color};
            color: #fff;
            font-size: 10px;
            padding: 1px 4px;
            border-radius: 2px;
            position: relative;
            top: -1.5em;
            white-space: nowrap;
            pointer-events: none;
          }
        `;
      }
    }

    // Remove old decorations
    const existing = this.cursors.get(userId);
    const oldIds = existing?.decorationIds || [];

    // Apply new decorations
    const newDecorations: monacoEditor.IModelDeltaDecoration[] = [
      {
        range: {
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column,
        },
        options: {
          className,
          stickiness: 1, // NeverGrowsWhenTypingAtEdges
        },
      },
      {
        range: {
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column,
        },
        options: {
          after: {
            content: ` ${userName}`,
            inlineClassName: labelClassName,
          },
          stickiness: 1,
        },
      },
    ];

    const decorationIds = this.editor.deltaDecorations(oldIds, newDecorations);

    this.cursors.set(userId, {
      decorationIds,
      lineNumber,
      column,
      userName,
    });
  }

  /**
   * Remove a remote user's cursor.
   */
  removeCursor(userId: string) {
    const existing = this.cursors.get(userId);
    if (existing) {
      this.editor.deltaDecorations(existing.decorationIds, []);
      this.cursors.delete(userId);
    }
  }

  /**
   * Clean up all cursors and styles.
   */
  dispose() {
    // Remove all decorations
    this.cursors.forEach((state) => {
      this.editor.deltaDecorations(state.decorationIds, []);
    });
    this.cursors.clear();

    // Remove style element
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }
}
